import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import os from 'os'
import fs from 'fs/promises'
import { constants as fsConstants } from 'fs'
import AdmZip from 'adm-zip'
import { checkAdmin } from '@/lib/userAuth'

const execFileAsync = promisify(execFile)

type BackupKind = 'full' | 'legacy'

type BackupItem = {
  name: string
  kind: BackupKind
  size: string
  sizeBytes: number
  time: string
}

const PROJECT_ROOT = process.cwd()
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backups')
const DB_FILE = path.join(PROJECT_ROOT, 'prisma', 'dev.db')
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'public', 'uploads')
const SCRIPT_PATH = path.join(PROJECT_ROOT, 'scripts', 'db-manager.sh')
const BACKUP_RETAIN_COUNT = Number.parseInt(process.env.BACKUP_RETAIN_COUNT || '30', 10)
const BACKUP_RETAIN_DAYS = Number.parseInt(process.env.BACKUP_RETAIN_DAYS || '30', 10)

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / (1024 ** 2)).toFixed(2)} MB`
  return `${(bytes / (1024 ** 3)).toFixed(2)} GB`
}

function resolveAndValidateBackupPath(backupName: string): string | null {
  const safeName = path.basename((backupName || '').trim())
  if (!safeName) return null
  if (!safeName.endsWith('.tar.gz') && !safeName.endsWith('.zip') && !safeName.endsWith('.sqlite')) return null

  const resolved = path.resolve(BACKUP_DIR, safeName)
  if (!resolved.startsWith(path.resolve(BACKUP_DIR) + path.sep)) return null
  return resolved
}

function getBackupKind(name: string): BackupKind {
  return name.endsWith('.sqlite') ? 'legacy' : 'full'
}

async function listBackups(): Promise<BackupItem[]> {
  try {
    await fs.access(BACKUP_DIR, fsConstants.R_OK)
  } catch {
    return []
  }

  const files = await fs.readdir(BACKUP_DIR)
  const backupFiles = files.filter((file) => file.endsWith('.tar.gz') || file.endsWith('.zip') || file.endsWith('.sqlite'))

  const items = await Promise.all(
    backupFiles.map(async (name) => {
      const filePath = path.join(BACKUP_DIR, name)
      const stats = await fs.stat(filePath)
      return {
        name,
        kind: getBackupKind(name),
        size: formatBytes(stats.size),
        sizeBytes: stats.size,
        time: stats.mtime.toISOString(),
      } satisfies BackupItem
    })
  )

  return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

async function createBackupWithScript(): Promise<string> {
  await fs.mkdir(BACKUP_DIR, { recursive: true })

  const now = new Date()
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
  const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.tar.gz`)

  // Verify database file exists
  try {
    await fs.access(DB_FILE, fsConstants.R_OK)
  } catch {
    throw new Error('Database file not found')
  }

  // Build tar arguments: always include database, optionally include uploads
  // Use absolute paths for -C to avoid relative path issues
  const prismaDir = path.resolve(PROJECT_ROOT, 'prisma')
  const publicDir = path.resolve(PROJECT_ROOT, 'public')
  const tarArgs = ['--force-local', '-czf', backupFile, '-C', prismaDir, 'dev.db']

  try {
    await fs.access(UPLOADS_DIR, fsConstants.R_OK)
    tarArgs.push('-C', publicDir, 'uploads')
  } catch {
    // uploads directory doesn't exist, skip
  }

  await execFileAsync('tar', tarArgs, { cwd: PROJECT_ROOT, timeout: 300_000 })

  const stats = await fs.stat(backupFile)
  return `Backup created: backup_${timestamp}.tar.gz (${formatBytes(stats.size)})`
}

async function pruneExpiredBackups(): Promise<string[]> {
  const backups = await listBackups()
  if (backups.length === 0) return []

  const now = Date.now()
  const retainMs = Math.max(1, BACKUP_RETAIN_DAYS) * 24 * 60 * 60 * 1000
  const keepNames = new Set(backups.slice(0, Math.max(1, BACKUP_RETAIN_COUNT)).map((backup) => backup.name))

  const expired = backups.filter((backup) => {
    const isBeyondCount = !keepNames.has(backup.name)
    const isExpiredByDays = now - new Date(backup.time).getTime() > retainMs
    return isBeyondCount || isExpiredByDays
  })

  await Promise.all(expired.map((backup) => fs.unlink(path.join(BACKUP_DIR, backup.name))))
  return expired.map((backup) => backup.name)
}

async function restoreFromTarGz(backupFile: string): Promise<void> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'onespace-restore-'))

  try {
    await execFileAsync('tar', ['--force-local', '-xzf', backupFile, '-C', tempDir], {
      cwd: PROJECT_ROOT,
      timeout: 300_000,
    })

    const restoredDb = path.join(tempDir, 'dev.db')
    await fs.access(restoredDb, fsConstants.R_OK)
    await fs.copyFile(restoredDb, DB_FILE)

    const restoredUploads = path.join(tempDir, 'uploads')
    try {
      await fs.access(restoredUploads, fsConstants.R_OK)
      await fs.rm(UPLOADS_DIR, { recursive: true, force: true })
      await fs.cp(restoredUploads, UPLOADS_DIR, { recursive: true })
    } catch {
      // Backups without uploads are still valid; skip silently.
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

async function restoreFromZip(backupFile: string): Promise<void> {
  const zip = new AdmZip(backupFile)
  const entries = zip.getEntries()
  const tempPrefix = entries.find((entry) => entry.entryName.includes('temp_'))?.entryName.split('/')[0]

  if (!tempPrefix) {
    throw new Error('Invalid zip backup format')
  }

  const dbEntry = zip.getEntry(`${tempPrefix}/dev.db`)
  if (!dbEntry) {
    throw new Error('Database file missing in zip backup')
  }

  const dbContent = zip.readFile(dbEntry)
  if (!dbContent) {
    throw new Error('Failed to read database file from zip backup')
  }
  await fs.writeFile(DB_FILE, dbContent)

  const uploadEntries = entries.filter(
    (entry) => entry.entryName.startsWith(`${tempPrefix}/uploads/`) && !entry.isDirectory
  )

  if (uploadEntries.length > 0) {
    await fs.rm(UPLOADS_DIR, { recursive: true, force: true })
    await fs.mkdir(UPLOADS_DIR, { recursive: true })

    await Promise.all(
      uploadEntries.map(async (entry) => {
        const fileName = path.basename(entry.entryName)
        if (!fileName) return
        const content = zip.readFile(entry)
        if (!content) return
        await fs.writeFile(path.join(UPLOADS_DIR, fileName), content)
      })
    )
  }
}

export async function GET(req: NextRequest) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'list') {
    try {
      const backups = await listBackups()
      return NextResponse.json({ backups })
    } catch (error) {
      return NextResponse.json({ error: `Failed to list backups: ${(error as Error).message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, backupName } = await req.json()

    if (action === 'backup') {
      try {
        console.log('[Database Backup] Starting backup...')
        const output = await createBackupWithScript()
        console.log('[Database Backup] Backup created:', output)
        const deleted = await pruneExpiredBackups()
        return NextResponse.json({
          message: output || 'Backup completed successfully',
          deleted,
        })
      } catch (error) {
        console.error('[Database Backup] Failed:', error)
        return NextResponse.json({ error: `Backup failed: ${(error as Error).message}` }, { status: 500 })
      }
    }

    if (action === 'restore') {
      const backupFile = resolveAndValidateBackupPath(String(backupName || ''))
      if (!backupFile) {
        return NextResponse.json({ error: 'Invalid backup name' }, { status: 400 })
      }

      try {
        await fs.access(backupFile, fsConstants.R_OK)
      } catch {
        return NextResponse.json({ error: 'Backup file not found' }, { status: 404 })
      }

      try {
        await createBackupWithScript()

        if (backupFile.endsWith('.sqlite')) {
          await fs.copyFile(backupFile, DB_FILE)
        } else if (backupFile.endsWith('.zip')) {
          await restoreFromZip(backupFile)
        } else {
          await restoreFromTarGz(backupFile)
        }

        return NextResponse.json({ message: 'Restore completed successfully' })
      } catch (error) {
        return NextResponse.json({ error: `Restore failed: ${(error as Error).message}` }, { status: 500 })
      }
    }

    if (action === 'delete') {
      const backupFile = resolveAndValidateBackupPath(String(backupName || ''))
      if (!backupFile) {
        return NextResponse.json({ error: 'Invalid backup name' }, { status: 400 })
      }
      try {
        await fs.unlink(backupFile)
        return NextResponse.json({ message: 'Backup deleted successfully' })
      } catch (error) {
        return NextResponse.json({ error: `Delete failed: ${(error as Error).message}` }, { status: 500 })
      }
    }

    if (action === 'prune') {
      try {
        const deleted = await pruneExpiredBackups()
        return NextResponse.json({
          message: deleted.length ? `已清理 ${deleted.length} 份过期备份` : '没有可清理的备份',
          deleted,
        })
      } catch (error) {
        return NextResponse.json({ error: `Prune failed: ${(error as Error).message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[Database API] Unhandled error:', error)
    return NextResponse.json({ error: `Server error: ${(error as Error).message}` }, { status: 500 })
  }
}
