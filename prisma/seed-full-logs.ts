
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LOGS_DATA = [
    // 2026-01-17
    { action: '修改', content: '服务列表管理：互换过滤项【关键词】和【服务类型】的位置', date: '2026-01-17T13:30:00Z' },
    { action: '增加', content: '日志管理：新增系统操作日志记录与查询功能', date: '2026-01-17T11:20:00Z' },
    { action: '修改', content: '团队管理：修改“选择职称”下拉框为动态获取后台配置数据', date: '2026-01-17T11:10:34Z' }, // Exact match to user request
    { action: '修改', content: '团队管理：优化职称过滤逻辑，支持忽略大小写匹配', date: '2026-01-17T11:15:00Z' },

    // 2026-01-16
    { action: '修改', content: '职位管理：修复职位编辑与删除后的模态框关闭逻辑', date: '2026-01-16T14:30:00Z' },
    { action: '修改', content: '职位管理：新增职位添加后自动跳转至团队列表', date: '2026-01-16T10:00:00Z' },

    // 2026-01-15
    { action: '修改', content: '项目管理：将列表与表单中的“项目标题”字段统一更名为“项目名称”', date: '2026-01-15T09:45:00Z' },

    // 2026-01-14
    { action: '修改', content: '管理员登录：修复本地与局域网访问下的登录权限校验问题', date: '2026-01-14T16:20:00Z' },
    { action: '增加', content: '表单优化：在报价询盘与流程管理中增加“m²”面积单位标识', date: '2026-01-14T14:10:00Z' },
    { action: '修改', content: 'FAQ管理：修复问题排序逻辑，确保前端按后台设定顺序展示', date: '2026-01-14T10:00:00Z' },

    // 2026-01-13
    { action: '修改', content: '项目案例：修复前端“别墅”分类下新项目不显示的Bug', date: '2026-01-13T11:00:00Z' },

    // 2026-01-12
    { action: '增加', content: '组件库：新增自定义日期范围选择器，支持快捷预设', date: '2026-01-12T15:30:00Z' },

    // 2026-01-10
    { action: '修改', content: '全站导航：修复“团队Team”导航链接跳转至首页的错误', date: '2026-01-10T11:20:00Z' },
    { action: '修改', content: 'UI优化：调整服务类型卡片背景亮度及菜单选中下划线样式', date: '2026-01-10T09:00:00Z' },

    // 2026-01-09
    { action: '修改', content: '服务页：重构页脚Footer，保持与首页样式一致', date: '2026-01-09T14:00:00Z' },

    // 2026-01-07
    { action: '增加', content: '团队管理：新增团队成员案例分配功能', date: '2026-01-07T16:00:00Z' },
    { action: '修改', content: '数据库：优化 TeamMember 模型结构，支持复杂案例关联', date: '2026-01-07T10:00:00Z' },

    // 2026-01-06
    { action: '修改', content: '系统配置：完成后台管理系统全站中文汉化', date: '2026-01-06T17:00:00Z' },
    { action: '增加', content: '前端模块：集成团队展示模块至官方网站', date: '2026-01-06T11:00:00Z' }
]

async function main() {
    console.log('Clearing old logs...')
    await prisma.systemLog.deleteMany()

    console.log('Seeding full history based on development timeline...')
    for (const log of LOGS_DATA) {
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
