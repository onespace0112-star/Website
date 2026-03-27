
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const types = [
        '软装设计',
        '室内设计',
        '建筑设计',
        '景观规划',
        '全球采购',
        '国际物流',
        '现场安装'
    ]

    for (const name of types) {
        await prisma.serviceType.upsert({
            where: { name },
            update: {},
            create: { name }
        })
    }

    console.log('Service types seeded')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
