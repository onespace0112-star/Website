
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.systemLog.create({
        data: {
            action: '修改',
            content: '服务列表管理：调整过滤项关键词和服务类型位置',
            createdAt: new Date()
        }
    })
    console.log('Added log entry.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
