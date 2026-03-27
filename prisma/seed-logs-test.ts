
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding test logs...')

    await prisma.systemLog.createMany({
        data: [
            {
                action: '系统测试',
                content: '这是一个测试日志，用于验证日志系统是否正常工作',
                createdAt: new Date(),
            },
            {
                action: '前端交互',
                content: '模拟用户点击了"获取报价"按钮',
                createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
            },
        ],
    })

    console.log('Test logs created.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
