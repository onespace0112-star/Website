// Complete FAQ data for ONE SPACE
// This can be used to seed the database or as static data

export interface FAQItem {
    id: number
    question_zh: string
    question_en: string
    answer_zh: string
    answer_en: string
    category: string
    order: number
}

export const faqData: FAQItem[] = [
    // 一、定位与角色类
    {
        id: 1,
        question_zh: '你们是卖家具的吗？',
        question_en: 'Are you a furniture store?',
        answer_zh: '不是。OneSpace 不是家具商城，也不是单一品牌。我们是以交付为核心的一站式服务团队，负责把设计意图真正、安全、可安装地落地。',
        answer_en: 'No. OneSpace is not an e-commerce store or a furniture brand. We are a service-led, one-stop delivery team. Our job is to make sure design intent becomes a real, installable result — with standards, evidence, milestones, and delivery control.',
        category: 'positioning',
        order: 1,
    },
    {
        id: 2,
        question_zh: '你们和普通采购代理 / 贸易公司有什么不同？',
        question_en: 'How are you different from regular sourcing agents?',
        answer_zh: '很多团队能下单，难的是稳定交付。我们的差异不在"关系"，而在体系：1. 设计语言转成交付标准；2. 质检证据链，而不是口头确认；3. 里程碑推进；4. 变更有规则、有评估；5. 交付前就校验安装条件。',
        answer_en: 'Most agents focus on placing orders. We focus on delivery outcomes. Our difference is the system: 1. Design intent → executable standards & lists; 2. QC evidence chain (photos/videos/records); 3. Milestone-based execution; 4. Change rules with impact assessment; 5. Delivery & installation readiness checks.',
        category: 'positioning',
        order: 2,
    },
    {
        id: 3,
        question_zh: '你们更适合什么类型的客户？',
        question_en: 'What type of clients are you best suited for?',
        answer_zh: '最适合以下客户：高端住宅（别墅/顶层/豪宅）、重视审美与细节、不希望被反复打断、对质量与交期敏感、希望一个团队统筹全链路。',
        answer_en: 'We are best for high-end residential clients who: care about aesthetics and details, want fewer surprises, are sensitive to quality and lead time, and prefer one accountable team instead of many vendors.',
        category: 'positioning',
        order: 3,
    },
    // 二、服务范围与能力
    {
        id: 4,
        question_zh: '你们支持全定制家具吗？',
        question_en: 'Do you support fully custom furniture?',
        answer_zh: '支持。定制是我们的核心能力。我们可以同时管理多类别、多工厂，并统一标准、节奏与交付顺序。',
        answer_en: 'Yes. Custom work is our core. We handle mixed categories (casegoods, upholstery, metal, stone, lighting) and unify them under one standard and delivery plan.',
        category: 'services',
        order: 4,
    },
    {
        id: 5,
        question_zh: '如果我已经有设计师 / 建筑师，还需要你们吗？',
        question_en: 'If I already have a designer/architect, do I still need you?',
        answer_zh: '需要，而且这正是我们价值最大的地方。我们不替代设计，而是把设计变成可采购、可生产、可安装的结果。',
        answer_en: 'Yes. We work with your designer. Our role is execution: translating drawings into purchasable standards, managing sourcing, QC, and delivery interfaces.',
        category: 'services',
        order: 5,
    },
    {
        id: 6,
        question_zh: '你们是否可以只做其中一部分（比如 QC 或采购）？',
        question_en: 'Can you do only part of the work (e.g., QC or sourcing)?',
        answer_zh: '可以。服务是模块化的。很多客户让我们作为"项目控制层"，专注 QC、节奏和交付风险。',
        answer_en: 'Yes. Services are modular. Some clients use us as a project control layer on top of their existing suppliers.',
        category: 'services',
        order: 6,
    },
    // 三、质量与风险控制
    {
        id: 7,
        question_zh: '你们如何做质量控制（QC）？',
        question_en: 'How do you handle quality control (QC)?',
        answer_zh: '质检不是一次检查，而是一条证据链：首件确认、过程抽检、出货前检查、包装与贴标核验。每一步都有照片/视频/问题闭环。',
        answer_en: 'QC is not a single inspection. We use a QC evidence chain, typically including: first-article inspection, in-line checks, pre-shipment inspection, and packaging verification. All with photo/video evidence and issue closure.',
        category: 'quality',
        order: 7,
    },
    {
        id: 8,
        question_zh: '如果我不能来中国看厂，是否安全？',
        question_en: "Is it safe if I can't visit China to see the factories?",
        answer_zh: '安全。我们的流程本身就是为远程决策设计的。你看的不是"说法"，而是证据。',
        answer_en: 'Yes. The system is designed for remote decision-making. You approve based on evidence, not promises.',
        category: 'quality',
        order: 8,
    },
    {
        id: 9,
        question_zh: '如果中途要改方案，怎么办？',
        question_en: 'What if I need to make changes midway?',
        answer_zh: '我们有明确的变更规则。所有变更都会先评估对成本、工期、质量的影响，经确认后执行。',
        answer_en: 'Changes are managed by rules. We assess impact on cost, lead time, and quality before execution, and proceed only after confirmation.',
        category: 'quality',
        order: 9,
    },
    // 四、交付、物流与安装
    {
        id: 10,
        question_zh: '你们负责物流吗？',
        question_en: 'Do you handle logistics?',
        answer_zh: '是的。我们负责出口物流与交付节奏协调，关注的是现场交付时间，而不是只到港。',
        answer_en: 'Yes. We coordinate export logistics and delivery scheduling. We plan around site dates, not just port-to-port shipping.',
        category: 'delivery',
        order: 10,
    },
    {
        id: 11,
        question_zh: '你们提供安装服务吗？',
        question_en: 'Do you provide installation services?',
        answer_zh: '视地区而定可提供安装支持。即使不做安装，也会提供安装就绪交付包，减少现场返工。',
        answer_en: 'Depending on location, we can support installation through vetted local teams. Even without installation, we provide an installation-ready package.',
        category: 'delivery',
        order: 11,
    },
    {
        id: 12,
        question_zh: '如何避免"到了现场才发现装不了"？',
        question_en: 'How do you prevent "can\'t install" surprises on site?',
        answer_zh: '我们在出货前就校验安装条件：尺寸、通道、五金、安装顺序，而不是等到现场才发现问题。',
        answer_en: 'We check installation conditions upstream: dimensions, access, hardware, and sequencing — before shipment.',
        category: 'delivery',
        order: 12,
    },
    // 五、费用与合作方式
    {
        id: 13,
        question_zh: '你们怎么收费？',
        question_en: 'How do you charge?',
        answer_zh: "我们不明码标价。费用取决于范围、复杂度和风险，并会清楚说明：包含什么、不包含什么、变更如何计价。",
        answer_en: "We don't publish fixed prices. Fees depend on scope, complexity, and risk level. We explain what's included, what's not, and how changes are priced.",
        category: 'pricing',
        order: 13,
    },
    {
        id: 14,
        question_zh: '最低项目规模是多少？',
        question_en: 'What is the minimum project size?',
        answer_zh: '没有绝对最低金额，但我们更适合交付风险较高、需要系统管理的项目。',
        answer_en: 'There is no hard minimum, but we are best suited for projects where delivery risk matters.',
        category: 'pricing',
        order: 14,
    },
    // 六、开始合作
    {
        id: 15,
        question_zh: '我需要准备什么才能开始？',
        question_en: 'What do I need to get started?',
        answer_zh: '你只需要准备：项目所在地、目标交付时间、风格参考、大致清单或空间数量。',
        answer_en: 'You can start with just: project location, target delivery time, style references, and rough list or space count.',
        category: 'getting-started',
        order: 15,
    },
    {
        id: 16,
        question_zh: '下一步流程是怎样？',
        question_en: 'What is the next step?',
        answer_zh: '流程很简单：1. 你提供基础信息；2. 我们确认范围与边界；3. 给你一套交付方案。',
        answer_en: '1. You send basic info; 2. We confirm scope & boundaries; 3. We propose a delivery plan.',
        category: 'getting-started',
        order: 16,
    },
]

export const faqCategories = {
    'positioning': { zh: '定位与角色', en: 'Positioning & Role' },
    'services': { zh: '服务范围与能力', en: 'Services & Capabilities' },
    'quality': { zh: '质量与风险控制', en: 'Quality & Risk Control' },
    'delivery': { zh: '交付、物流与安装', en: 'Delivery, Logistics & Installation' },
    'pricing': { zh: '费用与合作方式', en: 'Pricing & Cooperation' },
    'getting-started': { zh: '开始合作', en: 'Getting Started' },
}

// Homepage featured FAQs (IDs)
export const homepageFAQIds = [1, 2, 4, 7, 11, 15]
