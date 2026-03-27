
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Logs for 2026-01-01 to 2026-01-07
const PAST_LOGS = [
    { action: "删除", content: "清理无用的测试数据与临时文件", date: "2026-01-07T16:00:00Z" },
    { action: "修改", content: "数据库：优化 TeamMember 模型结构，支持复杂案例关联", date: "2026-01-07T10:00:00Z" },
    { action: "增加", content: "团队管理：新增团队成员案例分配功能", date: "2026-01-07T09:30:00Z" },

    { action: "修改", content: "调整用户权限校验逻辑", date: "2026-01-06T15:20:00Z" },
    { action: "增加", content: "前端：集成团队展示模块至官方网站", date: "2026-01-06T11:00:00Z" },
    { action: "修改", content: "系统配置：完成后台管理系统全站中文汉化", date: "2026-01-06T09:00:00Z" },

    { action: "修改", content: "优化首页轮播图加载速度", date: "2026-01-05T14:45:00Z" },
    { action: "增加", content: "询盘表单提交与后台查看功能", date: "2026-01-05T10:10:00Z" },

    { action: "增加", content: "项目案例列表前端展示页面", date: "2026-01-04T16:00:00Z" },
    { action: "修改", content: "导航栏样式调整，适配移动端显示失效问题", date: "2026-01-04T11:30:00Z" },

    { action: "增加", content: "后台服务管理增删改查模块", date: "2026-01-03T15:00:00Z" },
    { action: "增加", content: "OneSpace 服务列表展示前端页面", date: "2026-01-03T09:00:00Z" },

    { action: "增加", content: "搭建后台管理登录页面与鉴权逻辑", date: "2026-01-02T13:00:00Z" },
    { action: "增加", content: "开发前端首页 UI 框架与基础布局", date: "2026-01-02T10:00:00Z" },

    { action: "增加", content: "Prisma 数据库初始化与Schema设计", date: "2026-01-01T14:00:00Z" },
    { action: "增加", content: "项目基础脚手架搭建 (Next.js + Tailwind)", date: "2026-01-01T09:00:00Z" },
]

// Keep recent manual logs or system generated ones, but for this step we will merge or just append.
// To satisfy user specific request of seeing 1-1 to 1-7 in list perfectly, I'll ensure they are inserted.
// I will NOT delete existing logs from today/yesterday (created by previous steps), only append these old ones if not exist.
// Actually, simple way is to create them.

async function main() {
    console.log('Seeding past logs (2026-01-01 ~ 2026-01-07)...')

    for (const log of PAST_LOGS) {
        // Check if exists to avoid duplication if run multiple times (optional but good practice)
        // Since we don't have unique constraint on content+date, simple create is fine for now, 
        // assuming this script is run once.
        await prisma.systemLog.create({
            data: {
                action: log.action,
                content: log.content,
                createdAt: new Date(log.date)
            }
        })
    }
    console.log('Done.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
