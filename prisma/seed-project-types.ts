
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const types = ['别墅类型', '公寓类型', '商业类型']

    for (const name of types) {
        await prisma.projectType.upsert({
            where: { name },
            update: {},
            create: { name }
        })
    }

    console.log('Project types seeded')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
