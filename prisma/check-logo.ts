
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const logo = await prisma.siteLogo.findFirst({
        orderBy: { createdAt: 'desc' }
    })
    console.log('Logo in DB:', logo)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
