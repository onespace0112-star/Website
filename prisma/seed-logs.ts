
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INITIAL_LOGS = [
    {
        action: '增加',
        content: '“选择职称 列表需要过滤出相对应职称成员” 功能',
        createdAt: '2026-01-17T11:10:34.000Z'
    },
    {
        action: '增加',
        content: '“选择职称 列表需要过滤出相对应职称成员” 功能',
        createdAt: '2026-01-17T11:09:24.000Z'
    },
    {
        action: '增加',
        content: '“选择职称 列表需要过滤出相对应职称成员” 功能',
        createdAt: '2026-01-16T11:10:34.000Z'
    },
    {
        action: '增加',
        content: '“选择职称 列表需要过滤出相对应职称成员” 功能',
        createdAt: '2026-01-16T11:09:24.000Z'
    },
    {
        action: '增加',
        content: '“选择职称 列表需要过滤出相对应职称成员” 功能',
        createdAt: '2026-01-15T11:10:34.000Z'
    },
    {
        action: '增加',
        content: '“选择职称 列表需要过滤出相对应职称成员” 功能',
        createdAt: '2026-01-15T11:09:24.000Z'
    },
    {
        action: '增加',
        content: '“选择职称 列表需要过滤出相对应职称成员” 功能',
        createdAt: '2026-01-14T11:10:34.000Z'
    },
    {
        action: '增加',
        content: '“选择职称 列表需要过滤出相对应职称成员” 功能',
        createdAt: '2026-01-14T11:09:24.000Z'
    }
]

async function main() {
    console.log('Seeding System Logs...')

    // Clear existing logs to avoid duplicates if re-run (optional)
    await prisma.systemLog.deleteMany()

    for (const log of INITIAL_LOGS) {
        await prisma.systemLog.create({
            data: {
                action: log.action,
                content: log.content,
                createdAt: new Date(log.createdAt)
            }
        })
    }
    console.log('Seeded logs successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
