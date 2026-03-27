
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const phone = '18169833261'
    const user = await prisma.user.findUnique({
        where: { phone }
    })
    console.log('User with phone ' + phone + ':', user)

    const allUsers = await prisma.user.findMany()
    console.log('Total users:', allUsers.length)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
