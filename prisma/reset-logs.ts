
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Delete ALL existing logs to clear confusion
    await prisma.systemLog.deleteMany()
    console.log('Cleared all logs.')

    // 2. Add the specific log for the recent layout change
    // Using current time (or slightly in past if needed, but current is fine)
    await prisma.systemLog.create({
        data: {
            action: '修改',
            content: '服务列表管理：互换过滤项【关键词】和【服务类型】的位置',
            createdAt: new Date()
        }
    })
    console.log('Added log entry for layout change.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
