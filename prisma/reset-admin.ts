
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10)

        // Convert username to lowercase to avoid case sensitivity issues if any
        const username = 'admin'

        console.log(`Resetting password for user: ${username}`)

        const admin = await prisma.admin.upsert({
            where: { username },
            update: {
                password: hashedPassword
            },
            create: {
                username,
                password: hashedPassword
            }
        })

        console.log(`Success! Admin user '${admin.username}' password set to: password123`)
    } catch (error) {
        console.error('Error resetting password:', error)
    } finally {
        await prisma.$disconnect()
    }
}

resetAdmin()
