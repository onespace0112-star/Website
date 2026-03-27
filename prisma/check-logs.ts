
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const logs = await prisma.systemLog.findMany({
        orderBy: { createdAt: 'desc' }
    })
    console.log('Current Logs Count:', logs.length)
    console.log(logs)
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
