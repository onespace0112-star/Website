import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
})

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10)

    const admin = await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
        },
    })

    console.log('Created admin user:', admin.username)

    const project = await prisma.project.upsert({
        where: { slug: 'case-uae-villa-001' },
        update: {},
        create: {
            title: '迪拜别墅整屋交付（匿名案例）',
            slug: 'case-uae-villa-001',
            description: '匿名案例：迪拜（UAE）别墅整屋项目，涵盖设计支持、sourcing、采购执行、出货前 QC、物流分批计划与到场衔接。',
            coverImage: '/assets/projects/case-uae-villa-001/qc-1.jpg',
            content: `
        <div class="panel">
          <div class="kicker">ANONYMIZED CASE STUDY</div>
          <h1>迪拜别墅整屋交付（匿名案例）</h1>
          <p class="lead">
            该项目目标不是“买到便宜”，而是“按节点落地交付”：在跨国沟通、品类复杂与现场工期约束下，
            用里程碑推进 + 出货前 QC 证据链 + 分批到场策略，让客户远程也能掌控交付。
          </p>
          <div class="meta">
            <span class="chip">Dubai, UAE</span>
            <span class="chip">高端住宅（Residential）</span>
            <span class="chip">别墅｜多楼层｜多空间</span>
            <span class="chip">Design support · Sourcing · Purchasing · QC · Logistics</span>
          </div>
        </div>
        
        <h2>Case Summary</h2>
        <p>Location: Dubai, UAE</p>
        <p>Scope: Whole-home delivery</p>
      `,
        },
    })

    console.log('Created project:', project.title)

    // Seed Project Types
    const projectTypes = ['别墅', '公寓', '酒店', '学校']
    for (const typeName of projectTypes) {
        await prisma.projectType.upsert({
            where: { name: typeName },
            update: {},
            create: { name: typeName }
        })
    }
    console.log('Seeded project types:', projectTypes.join(', '))

}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
