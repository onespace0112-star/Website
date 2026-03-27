export const locales = ['zh', 'en'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'

const zh = {
    // Header
    nav: {
        services: '服务',
        product: '产品',
        process: '流程',
        cases: '案例',
        faq: '常见问题',
        team: '团队',
        contact: '联系',
        home: '首页',
        whatsapp: 'WhatsApp',
        languageLabel: '语言',
    },
    // Hero
    hero: {
        kicker: '高端住宅 · 一站式交付',
        title1: '高端住宅',
        title2: '一站式交付',
        subtitle: 'Design · Sourcing · QC · Logistics · Installation',
        learnMore: '了解更多 →',
        contactNow: '立即咨询 →',
    },
    // Why Us
    whyUs: {
        title: '为什么选择我们',
        item1: {
            title1: '我们翻译的是',
            title2: '设计语言',
            desc: '不是语言翻译，而是把审美转成可执行标准：材质、工艺、色号、尺寸、安装条件。减少买错、减少拼贴感。',
        },
        item2: {
            title1: '我们交付的是',
            title2: '证据链',
            desc: '出货前 QC：照片、视频、确认记录。问题闭环：返工、补发、替换确认后出货。把争议变成证据。',
        },
        item3: {
            title1: '我们按',
            title2: '里程碑',
            title3: '推进',
            desc: '范围确认 → 清单/规格 → 下单推进 → QC → 到场计划 → 安装协调。进度可控、沟通省心。',
        },
    },
    // Services
    services: {
        title: '核心服务',
        subtitle: '把设计意图变成可交付结果',
        items: [
            { title: 'Design Coordination', zh: '设计对接与标准化', desc: '把设计语言转成可执行标准：材质、工艺、色号、尺寸、安装条件' },
            { title: 'Sourcing & Procurement', zh: '采购与供应商整合', desc: '匹配供应链：预算×质量×交期×落地条件的最优组合' },
            { title: 'QC Evidence Chain', zh: '质检证据链', desc: '出货前检查、照片视频留存、问题闭环处理后再出货' },
            { title: 'Logistics & Delivery', zh: '物流与交付', desc: '按项目节点组织发货与到港计划，匹配现场窗口' },
            { title: 'Installation Readiness', zh: '安装条件校验', desc: '尺寸/墙体/管线/承重/收口条件提前校验，避免到场装不了' },
            { title: 'Project Control', zh: '项目与变更管理', desc: '里程碑推进、变更评估、风险预警，把复杂变成可控' },
        ],
    },
    // Process
    process: {
        title: '交付流程',
        subtitle: '用里程碑把复杂交付拆成可确认、可追踪的节点',
        steps: [
            { step: 'A', title: 'Scope & Standard', zh: '范围与标准确认', items: ['项目地、时间、风格', '清单/规格/边界', '预算与变更规则'] },
            { step: 'B', title: 'Production & QC', zh: '生产与证据链', items: ['下单推进与进度管理', '出货前 QC 证据链', '问题闭环处理'] },
            { step: 'C', title: 'Delivery & Install', zh: '交付与安装', items: ['装柜/出运/到场计划', '安装条件校验', '交付验收'] },
        ],
    },
    // Coverage
    coverage: {
        title: '服务地区',
    },
    // Projects
    projects: {
        title: '项目案例',
        viewAll: '查看全部 →',
        placeholder: '案例展示位',
    },
    // Team
    team: {
        title: '专业团队',
        subtitle: '核心交付团队，把控交付的每一个环节',
        viewAll: '查看全部成员 →',
        cases: '过往案例',
        motto: '服务宗旨',
        emptyState: '团队成员更新中...',
        ctaTitle: '请发送您的项目详情\n我们将在 24 小时内与您联系',
        ctaDesc: '如需快速获取报价，请随时通过 WhatsApp 联系我们：',
        contactBtn: '联系我们',
    },
    // FAQ
    faq: {
        title: '常见问题',
        viewAll: '查看全部 →',
    },
    // Contact
    contact: {
        title: '准备好开始了吗？',
        subtitle: '告诉我们你的项目地、时间、风格参考',
        subtitle2: '我们给你一个清晰的执行计划',
        cta: 'WhatsApp 咨询',
    },
    // Footer
    footer: {
        tagline: '高端住宅一站式交付',
        services: '服务',
        resources: '资源',
        contact: '联系',
        cases: '案例',
        team: '团队',
        coverage: '服务地区',
        admin: '管理后台',
        copyright: '© 2026 ONE SPACE. 保留所有权利。',
        landscape: '景观规划',
        procurement: '全球采购',
        logistics: '国际物流',
        installation: '现场安装',
        showroomVideo: '展厅视频',
        aboutUs: '关于我们',
    },
    // Profile
    profile: {
        title: '我的账户',
        logout: '退出登录',
        history: '聊天记录',
        newChat: '新对话',
        noHistory: '暂无历史记录',
        startFirst: '开始你的第一次对话 →',
        delete: '删除',
        confirmDelete: '确定要删除这段对话吗？',
        loading: '加载中...',
        account: '账户信息',
        welcome: '你好，',
        subtitle: '在这里管理您的项目偏好与咨询历史。',
        reportTitle: '一站式项目报告',
        reportDesc: '正在为您的项目生成实时交付看板。',
        footerTag: 'ONE SPACE · 高端住宅交付 · 卓越源于细节',
    },
    // Auth
    auth: {
        login: '登录',
        register: '注册',
        email: '邮箱',
        phone: '手机号',
        password: '密码',
        noAccount: '没有账号？',
        hasAccount: '已有账号？',
        loginNow: '立即登录',
        registerNow: '立即注册',
        welcomeBack: '欢迎回来',
        backToHome: '返回首页',
        account: '账号',
        loginSubtitle: '登录以继续使用 AI 智能助手',
        createAccount: '创建账户',
        registerSubtitle: '注册后可使用 AI 智能客服',
        byEmail: '邮箱',
        byPhone: '手机号',
        byMobile: '手机号登录',
        byEmailTab: '邮箱登录',
        name: '名字',
        placeholderName: '您的姓名',
        confirmPassword: '确认密码',
        placeholderConfirm: '再次输入密码',
        errorNamePassword: '请填写姓名和密码',
        errorEmailPhone: '请填写邮箱或手机号',
        errorEmailFormat: '邮箱格式错误',
        errorPhoneFormat: '手机格式错误',
        errorPasswordMatch: '两次输入的密码不一致',
        errorPasswordLength: '密码长度至少为 6 位',
        errorRegistrationFailed: '注册失败，请检查账号是否已存在',
        errorLoginFailed: '登录失败，请检查账号和密码',
        errorTryAgain: '发生错误，请稍后再试',
        forgotPassword: '忘记密码？',
        resetPassword: '重置密码',
        newPassword: '新密码',
        verificationCode: '验证码',
        getCode: '获取验证码',
        codeSent: '验证码已发送',
        codeResendIn: '秒后可重发',
        back: '返回',
        confirm: '确认',
        signUp: '注册',
        newToOnespace: '还没有账号？',
        alreadyHaveAccount: '已有账号？',
        passwordHint: '输入6-14位字母和数字，不含空格',
        placeholderEmail: '请输入邮箱地址',
        placeholderPhone: '请输入手机号',
        placeholderCode: '请输入验证码',
        countryRegionCode: '国家/地区代码',
        resetSuccess: '密码重置成功，请登录',
        errorCodeRequired: '请输入验证码',
        errorCodeInvalid: '验证码错误或已过期',
        errorUserNotFound: '用户不存在',
        errorCodeTooFrequent: '请求过于频繁，请稍后再试',
        termsAgreement: '登录或注册即表示您同意',
        termsOfService: '服务条款',
        and: '和',
        privacyPolicy: '隐私政策',
    },
    // Feedback
    feedback: {
        title: '反馈或建议',
        successTitle: '提交成功',
        successDesc: '感谢您的反馈',
        typeLabel: '类型：',
        imageLabel: '图片：',
        changeImage: '更换',
        uploadHeader: '上传',
        descLabel: '描述：',
        placeholder: '请根据您所选择的类型输入详细说明',
        cancel: '取消',
        submit: '提交',
        submitting: '提交中...',
        uploading: '上传中...',
        errorUpload: '图片上传失败',
        errorSubmit: '提交失败，请重试',
    },

    // Chat Widget
    chat: {
        title: 'ONE SPACE AI 客服',
        subtitle: '在线为您解答装修与交付问题',
        myProgress: '我的进度',
        welcome: '您好！我是 ONE SPACE 的智能助手。您可以点击下方按钮快速开始，或者直接输入您关心的问题。',
        tags: ['交付流程', '采购清单', '质检标准', '海外运包'],
        loginPrompt: '登录后即可同步咨询记录并获取一站式项目报告',
        loginBtn: '立即登录',
        placeholder: '输入您的问题...',
        whatsapp: 'WhatsApp 咨询',
        team: 'ONE SPACE 交付团队',
        errorBusy: '抱歉，系统繁忙，请稍后再试。',
        errorNetwork: '连接失败，请检查网络。',
    },
    // Project Case Translations (for db content)
    projectMap: {
        'Australia Luxury': '澳式奢华',
        'Australian': '澳大利亚',
        'Europe French': '欧式法式',
        'France': '法国',
        'UAE Luxury': '阿联酋奢华',
        'United Arab Emirates': '阿联酋',
        'Thailand Vintage': '泰式复古',
        'Thailand': '泰国',
        'American Modern': '美式现代',
        'United States': '美国',
        'United States ': '美国',
        'Arabic': '阿拉伯风格',
        'Luxurious villa in London': '伦敦奢华别墅',
        'London, United Kingdom': '伦敦，英国',
        'Dubai luxurious European-style villa': '迪拜奢华欧式别墅',
        'Dubai, United Arab Emirates': '迪拜，阿联酋',
        'Paris Vacation Villa': '巴黎度假别墅',
        'Paris, France': '巴黎，法国',
        'New York Penthouse': '纽约顶层公寓',
        'New York, USA': '纽约，美国',
        'Aqaba Apartment': '亚喀巴公寓',
        'Paris Apartment': '巴黎公寓',
        'Aleppo Apartment': '阿勒颇公寓',
        'Haifa Hotei': '海法酒店',
        'Gwneva Hotel': '日内瓦酒店',
        'Basra Hotel': '巴士拉酒店',
        'Rome high School': '罗马高中',
        'Al-Gaza University': '加沙大学',
        'Salem University': '塞拉莱大学',
        'Aqaba, Jordan': '亚喀巴，约旦',
        'Aleppo, Syria': '阿勒颇，叙利亚',
        'Haifa, Israel': '海法，以色列',
        'Geneva, Switzerland': '日内瓦，瑞士',
        'Basra, Iraq': '巴士拉，伊拉克',
        'Rome, Italy': '罗马，意大利',
        'Gaza, Palestine': '加沙，巴勒斯坦',
        'Salem, Oman': '塞拉莱，阿曼',
        'Hamburg, Germany': '汉堡，德国',

        // Why Us
        'Professional Integration': '专业整合',
        'Global Project Experience': '全球项目经验',
        'Main Supplier Chain': '核心供应链',
        'Significant Cost Advantage': '显著的价格优势',
        'Connecting the entire chain from design to delivery, simplifying complex cross-border procurement processes to bring customers an easy and convenient receiving experience.': '连接从设计到交付的全链路，简化复杂的跨境采购流程，为客户带来轻松便捷的收货体验。',
        'ONE SPACE has successfully served over 50 countries worldwide, completed more than 3,000 projects, and accumulated rich experience in handling cross-border business.': 'ONE SPACE 已成功服务全球 50 多个国家，完成 3,000 多个项目，在跨境业务处理方面积累了丰富经验。',
        'Leveraging Foshan\'s advantage as the global furniture capital, carefully selecting from over 10,000 suppliers to ensure excellent product quality and competitive pricing.': '依托佛山“世界家具之都”优势，从 10,000 多家供应商中严选，确保卓越产品质量与竞争力价格。',
        'Through scaled procurement and direct factory cooperation, saving clients 30%-50% in costs, significantly lower than local procurement prices for equivalent quality.': '通过规模化采购与工厂直供合作，为客户节省 30%-50% 成本，显著低于同等质量的本地采购价格。',
        // Advantages
        'More than 10 years of exporting whole house one-stop solution experience': '超过 10 年的全屋一站式解决方案出口经验',
        'More than 50 countries choose us': '超过 50 个国家的客户选择我们',
        'More than 60 global partners': '超过 60 个全球合作伙伴',
        'More than 200 designers provide professional design service for you': '超过 200 名设计师为您提供专业设计服务',
        'More than 1000 kinds of furniture and soft furnishing furniture for your choose': '超过 1000 种家具和软装家具供您选择',
        'More than 2000 construction projects': '超过 2000 个建筑施工项目',
        'Onespace\'s professional services will make your life much more convenient and reassuring.': 'ONE SPACE 的专业服务将让您的生活更加便捷、更加省心。',
        // After Sales
        'Storage cabinet installation': '储物柜安装',
        'Desk installation': '书桌安装',
        'Office desk installation': '办公桌安装',
        'Professional on-site installation and maintenance services to ensure every detail of overseas projects falls perfectly.': '提供专业的现场安装与维护服务，确保海外项目每个细节都精准落地。',
        'Provide localized after-sales team support and technical consultation through our network of global partners.': '通过我们的全球合作伙伴网络，提供本地化售后团队支持与技术咨询。',
        'With years of cross-border delivery experience, providing long-term quality assurance and maintenance plans for every project.': '依托多年跨境交付经验，为每个项目提供长期质量保障与维护方案。',
        'Case | Taiwanese Modern Style': '案例 | 台湾现代风格',
        'European-style Wooden Paradigm': '欧式木艺典范',
        'A minimalist approach blending traditional Oriental aesthetics with modern functionality.': '将东方传统审美与现代功能融合的极简主义方案。',
        'Exceptional wood craftsmanship creating a warm, timeless atmosphere in a tropical setting.': '卓越木作工艺，在热带环境中营造温暖且历久弥新的空间氛围。',
    },
    teamMap: {
        // Positions
        'Founder & CEO': '创始人兼首席执行官',
        'Vice CEO & COO': '副总裁兼首席运营官',
        'Sales Project Manager': '销售项目经理',
        'Sales Manager': '销售经理',
        'Design Director': '设计总监',
        'Designer': '设计师',
        'Product Manager': '产品经理',
        'Social Media Marketing Manager': '社媒营销经理',
        'Web Manager': '网站经理',
        'Financial Manager': '财务经理',
        'Human Resources Manager': '人力资源经理',
        'General Affairs Manager': '总务经理',
        'Purchasing Specialist': '采购专员',
        'Administrative Specialist': '行政专员',

        // Working Years
        '15+ years of working experience': '15年以上从业经验',
        '8+ years in design & furniture, with a global aesthetic. End-to-end delivery and supply chain integration.': '8年以上设计与家具行业经验，具备全球化审美。全流程交付与供应链整合。',
        '5+ years of working experience': '5年以上从业经验',
        '6+ years of working experience': '6年以上从业经验',
        '7+ years of working experience': '7年以上从业经验',
        '8+ years of working experience': '8年以上从业经验',
        '9+ years of working experience': '9年以上从业经验',
        '10+ years of working experience': '10年以上从业经验',
        '11+ years of working experience': '11年以上从业经验',
        '12+ years of working experience': '12年以上从业经验',
        '22+ years of working experience': '22年以上从业经验',
        '12 years of experience in the financial industry': '12年金融行业经验',
        '6 years of order processing experience': '6年订单处理经验',
        'Social media marketing specialist with 7+ years\' experience.': '7年以上社媒营销专家经验',
        '15 years working experience': '15年从业经验',
        '15 years of working experience': '15年从业经验',
        '10 years of work experience.': '10年从业经验',
        '10 years working experience': '10年从业经验',
        '6 year working experience': '6年从业经验',
        '6 year project experience': '6年项目经验',
        '7 years working experience': '7年从业经验',
        '9 years working experience': '9年从业经验',
        '5 years working experience': '5年从业经验',
        '5 years of sales experience': '5年销售经验',

        // Responsibilities
        'Leads overall corporate strategy and brand direction, oversees high-end project delivery, drives business layout and brand value upgrading.': '领导公司整体战略和品牌方向，监督高端项目交付，推动业务布局和品牌价值升级。',
        'A member of the founding team, involved in establishing the company and driving its early growth. Responsible for day-to-day operations and execution, typically overseeing processes, delivery, supply chain, cross-functional collaboration, project management, and operational efficiency.': '创始团队成员，参与公司建立并推动早期增长。负责日常运营与执行，统筹流程、交付、供应链、跨部门协作、项目管理及运营效率。',
        'The Marketing Department is responsible for market research, brand promotion, marketing planning, and customer development and retention. It also undertakes the full process of video shooting and editing, including script creation, on-site shooting, post-production editing, special effects production, and sound and music matching, to produce promotional videos that meet marketing needs and appeal to the audience.': '市场部负责市场调研、品牌推广、营销策划以及客户开发与维护。同时承担视频拍摄与剪辑的全流程工作，包括脚本创作、现场拍摄、后期剪辑、特效制作及音效搭配，制作出符合营销需求且具吸引力的宣传视频。',
        'Job Responsibilities: Oversee the overall procurement of all corporate products and cargo, conduct full-process quality control (QC), arrange logistics and transportation, coordinate on-site cargo installation services, and ensure the standardized and efficient operation of the entire product supply and delivery process.': '职责：负责公司所有产品和货物的整体采购，进行全流程质量控制（QC），安排物流运输，协调现场货物安装服务，确保整个产品供应和交付流程的标准化与高效运作。',
        'Oversee the full spectrum of the company\'s human resources functions, build and implement the HR system, and support the company\'s overseas business expansion and organizational development.': '全面负责公司的人力资源职能，构建并实施HR体系，支持公司的海外业务拓展与组织发展。',
        'Project management and execution, ensuring the smooth progress of the project and providing professional management and coordination for every stage from project initiation to completion.': '项目管理与执行，确保项目平稳推进，为从启动到完成的每个阶段提供专业的管理与协调。',
        'Mainly responsible for website design and development': '主要负责网站的设计与开发。',
        'Oversee the full lifecycle promotion and implementation of projects, follow up the entire process from project initiation, planning to closure and review, ensure the efficient connection and smooth delivery of all links, and provide professional overall coordination and implementation support for each project phase.': '监督项目的全生命周期推广与执行，跟进从立项、规划到结束和复盘的全过程，确保各环节高效对接、顺利交付，并为各项目阶段提供专业的整体协调和执行支持。',
        'Years of project management experience, full lifecycle closed-loop planning, precise node control, efficient project delivery assurance': '多年的项目管理经验，全生命周期闭环规划，精准节点控制，高效的项目交付保证。',
        'Teamleadership,project tracking,design  prosess examine and verify.': '团队领导，项目追踪，设计流程审核与验证。',
        'Follow up with customers who have made a purchase or expressed strong interest. Confirm requirements, dimensions, style, and budget. Liaise with designers, follow up on proposals and quotes. Assist with contract and payment milestones. Place orders with the factory and track production progress. Coordinate shipping, installation, and after-sales issues. Ensure that the project is delivered on time and to the required quality standards.': '跟进已成交或有强烈意向的客户。确认需求、尺寸、风格及预算。对接设计师，跟进方案与报价。协助合同及付款节点。向工厂下单并跟踪生产进度。协调物流、安装及售后问题。确保项目按时按质交付。',
        'Strategic support and planning: Participate in the formulation of strategies, assess feasibility and risks from a financial perspective, and provide data and recommendations.  Budget management and control: Prepare and manage the budget, collaborate with the business to set goals, allocate resources, track deviations in execution and make corrections.  Operational analysis and decision support: Regularly analyze key indicators such as revenue, costs, profits, and cash flow, identify problems and opportunities, and support decision-making.  Risk Control and Compliance Management: Identify, assess, and monitor financial risks (such as market/credit/operational risks), formulate response measures, and ensure compliance.  Review of contract financial terms: Review the financial terms of the contract and agreement to ensure they are reasonable and legal, and to reduce contract risks.  Financial - Business Synergy: As a communication bridge between finance and business, it aims to enhance collaboration efficiency and ensure successful implementation.  Process and System Optimization: Improve financial processes, advance ERP improvements and enhance data efficiency.': '战略支持与规划：参与战略制定，从财务角度评估可行性与风险，提供数据与建议。预算管理与控制：编制并管理预算，与业务部门协作设定目标、分配资源，追踪执行偏差并纠正。运营分析与决策支持：定期分析收入、成本、利润及现金流等关键指标，识别问题与机会，支持决策。风控与合规管理：识别、评估并监控财务风险（如市场/信用/操作风险），制定应对措施并确保合规。合同财务条款审查：审查合同及协议的财务条款，确保其合理合法，降低合同风险。业财融合：作为财务与业务的沟通桥梁，旨在提升协作效率，确保成功实施。流程与系统优化：改进财务流程，推进ERP优化并提升数据效率。',
        'Oversees the overall operation of the company\'s administrative and general affairs, responsible for the coordination of office management, logistics support, document filing, meeting organization, visitor reception and internal and external department communication, optimizes administrative processes and controls related expenses, and provides comprehensive and efficient administrative support for the company\'s daily operation and business development.': '全面负责公司行政及总务工作的整体运作，统筹办公管理、后勤保障、文档归档、会议组织、访客接待及内外部部门沟通，优化行政流程并控制相关费用，为公司日常运营及业务发展提供全面高效的行政支持。',
        'Overseas Commercial Residential Architecture & Interior Design Projects Operations International Brand Projects Strategic Cooperation Operations': '海外商住建筑与室内设计项目运营，国际品牌项目战略合作运营。',
        'Responsible for managing overseas clientcommunication, coordinating sales and creativeteams, and ensuring projects are deliveredsmoothly from briefing to final delivery.': '负责管理海外客户沟通，协调销售和创意团队，确保项目从简报到最终交付的平稳进行。',
        'Working closely with overseas clients,connecting sales and creative teams, anddriving projects from ideas to real-world delivery.': '与海外客户紧密合作，连接销售和创意团队，推动项目从构想到实物交付。',
        'Actively engaging with overseas clients, drivingcollaboration across teams, and bridgingbusiness decisions with execution to movecomplex projects confidently toward delivery.': '积极与海外客户互动，推动跨团队协作，架起业务决策与执行的桥梁，推动复杂项目稳步走向交付。',
        'Translating client ideas into actionableoutcomes, this role bridges business strategyand team execution to drive overseas projectsfrom complexity to clarity.': '将客户的想法转化为可落地的方案，此角色连接商业策略与团队执行，推动海外项目从复杂走向清晰。',
        'Working closely with overseas clients,energizing collaboration across teams, anddriving projects from initial ideas to successful,well-executed delivery.': '与海外客户紧密合作，激发跨团队协作，推动项目从初步构想到成功、高标准的落地交付。',
        'Responsible for delivering full-service interiordesign for overseas residential projects,managing the process from concept to finaldelivery with a strong focus on international': '负责海外住宅项目的全案室内设计，管理从概念到最终交付的全过程，专注于国际化标准。',
        'Responsible for leading full-service interiordesign for overseas residential projects,overseeing the process from design strategy tofinal delivery, and ensuring a high standard of': '负责领导海外住宅项目的全案室内设计，监督从设计策略到最终交付的流程，确保高标准呈现。',
        'Working closely with clients and the team onoverseas residential projects, turning designideas into well-executed, real-world spacesthrough the full design process.': '在海外住宅项目中与客户及团队紧密合作，通过全流程设计将创意转化为落地实景。',
        'Communicating closely with overseas clients,brainstorming with the team, and turning designideas into real, livable spaces throughout thefull design process.': '与海外客户密切沟通，与团队头脑风暴，通过全流程设计将创意转化为真实宜居的空间。',
        'Collaborating closely with overseas clients andcross-functional teams to shape designconcepts and deliver full-service interiorsolutions that balance creativity, functionality': '与海外客户及跨职能团队紧密协作，塑造设计理念，提供兼顾创意与功能的全案室内解决方案。',
        // Additional Responsibilities
        'Leads overall strategy, brand direction, and high-end project delivery.': '领导整体战略、品牌方向及高端项目交付。',
        'Engaging in sales work is a highly professional and mature service-oriented sales role.': '作为一名高度专业且成熟的服务型销售，致力于为客户提供卓越价值。',
        'Working closely with overseas clients, connecting sales and creative teams, and driving projects from ideas to real-world delivery.': '与海外客户紧密合作，连接销售与创意团队，推动项目从构想到实地交付。',
        'Working closely with overseas clients, energizing collaboration across teams, and driving projects from initial ideas to successful, well-executed delivery.': '与海外客户紧密合作，激发跨团队协作，推动项目从初步构想到成功落地交付。',
        'Responsible for managing overseas client communication, coordinating sales and creative teams, and ensuring projects are delivered smoothly from briefing to final delivery.': '负责管理海外客户沟通，协调销售与创意团队，确保项目从简报到最终交付的顺利进行。',
        'Responsible for leading overseas client engagement and overall project coordination, bridging sales, project, and delivery teams to ensure complex projects are executed efficiently and delivered successfully.': '负责统筹海外客户对接与项目协同，连接销售、项目与交付团队，确保复杂项目高效推进并成功落地。',
        'Actively engaging with overseas clients, driving collaboration across teams, and bridging business decisions with execution to move complex projects confidently toward delivery.': '积极与海外客户互动，推动跨团队协作，连接业务决策与执行，稳步推动复杂项目交付。',
        'Job responsibilities: product procurement, quality control (QC), transportation arrangements, cargo installation services.': '岗位职责：产品采购、质量控制（QC）、运输安排、货物安装服务。',
        'Responsible for the design of website pages, the establishment and development of the system': '负责网页设计、系统建立与开发。',
        'The Marketing Department is responsible for market research, brand promotion, marketing planning, customer expansion and maintenance, etc. At the same time, it undertakes video shooting and editing tasks, including script creation, on-site shooting, post-production material editing, special effect adding, and sound effect and music matching, so as to produce promotional videos that meet marketing needs and attract the audience.': '市场部负责市场调研、品牌推广、营销策划、客户拓展与维护等工作；同时承担视频拍摄剪辑任务，包括脚本创作、现场拍摄、后期素材剪辑、特效添加及音效配乐，制作符合营销需求并具吸引力的宣传视频。',
        'The procurement and management of office supplies, the handling of documents and archives, the preparation and recording of meetings, the reception of visitors, the control of administrative expenses, the maintenance of the office environment, as well as the communication and coordination between internal and external departments.': '负责办公用品采购与管理、文档处理、会议组织、访客接待、行政费用控制、办公环境维护以及内外部部门沟通协调。'
        ,
        'Responsible for delivering full-service interior design for overseas residential projects, managing the process from concept to final delivery with a strong focus on international aesthetics and lifestyle needs.': '负责海外住宅项目的全案室内设计，管理从概念到最终交付的全过程，重点关注国际化审美与生活方式需求。',
        'Working closely with clients and the team on overseas residential projects, turning design ideas into well-executed, real-world spaces through the full design process.': '在海外住宅项目中与客户及团队紧密合作，通过完整设计流程将创意转化为高质量落地空间。',
        'Collaborating closely with overseas clients and cross-functional teams to shape design concepts and deliver full-service interior solutions that balance creativity, functionality, and real-world execution.': '与海外客户及跨职能团队紧密协作，塑造设计概念并提供兼顾创意、功能与落地执行的全案室内解决方案。',
        'Communicating closely with overseas clients, brainstorming with the team, and turning design ideas into real, livable spaces throughout the full design process.': '与海外客户紧密沟通，与团队共同头脑风暴，通过全流程设计将创意转化为真实宜居的空间。',
        'Responsible for leading full-service interior design for overseas residential projects, overseeing the process from design strategy to final delivery, and ensuring a high standard of quality, consistency, and international aesthetics.': '负责领导海外住宅项目的全案室内设计，统筹从设计策略到最终交付的全过程，确保高质量、一致性与国际化审美标准。'
    },
    countryMap: {
        "United Arab Emirates": "阿联酋",
        "Saudi Arabia": "沙特阿拉伯",
        "Qatar": "卡塔尔",
        "Kuwait": "科威特",
        "Bahrain": "巴林",
        "Oman": "阿曼",
        "Turkey": "土耳其",
        "Israel": "以色列",
        "Jordan": "约旦",
        "Lebanon": "黎巴嫩",
        "United Kingdom": "英国",
        "Germany": "德国",
        "France": "法国",
        "Italy": "意大利",
        "Spain": "西班牙",
        "Netherlands": "荷兰",
        "Switzerland": "瑞士",
        "Sweden": "瑞典",
        "Norway": "挪威",
        "Denmark": "丹麦",
        "Finland": "芬兰",
        "Belgium": "比利时",
        "Austria": "奥地利",
        "Greece": "希腊",
        "Portugal": "葡萄牙",
        "Ireland": "爱尔兰",
        "Poland": "波兰",
        "Czech Republic": "捷克",
        "Hungary": "匈牙利",
        "Romania": "罗马尼亚"
    },
    // New Luxury Sections
    luxury: {
        getQuote: '获取报价',
        heroTitle: '高端住宅 | 一站式交付',
        heroSubtitle: '设计 | 采购 | 施工 | 交付',
        heroAlt: '豪宅全景',
        goToSlide: '跳转至幻灯片',
        contactBgAlt: '联系背景图',
        whyTitle: '为什么选择 ONE SPACE?',
        whyItems: [
            {
                title: '专业整合',
                desc: '连接从设计到交付的全产业链，简化复杂的跨境采购流程，为客户带来轻松便捷的收货体验。'
            },
            {
                title: '全球项目经验',
                desc: 'ONE SPACE 已成功服务全球 50 多个国家，完成 3,000 多个项目，在处理跨境业务方面积累了丰富的经验。'
            },
            {
                title: '核心供应链',
                desc: '依托佛山“世界家具之都”的优势，从 10,000 多家供应商中精选，确保卓越的产品质量和极具竞争力的价格。'
            },
            {
                title: '显著的价格优势',
                desc: '通过规模化采购和工厂直供合作，为客户节省 30%-50% 的成本，明显低于同等质量的当地采购价格。'
            }
        ],
        advantagesTitle: '我们的 优势',
        advantagesItems: [
            '超过 10 年的全屋一站式解决方案出口经验',
            '超过 50 个国家的客户选择我们',
            '超过 60 个全球合作伙伴',
            '超过 200 名设计师为您提供专业设计服务',
            '超过 1000 种家具和软装家具供您选择',
            '超过 2000 个建筑施工项目'
        ],
        casesTitle: '完工 案例',
        cases: [
            {
                title: '案例 | 台湾现代风格',
                desc: '一种将传统东方美学与现代功能完美结合的极简主义方案。'
            },
            {
                title: '欧式木艺典范',
                desc: '卓越的木工工艺，在热带环境中营造出温暖、永恒的氛围。'
            }
        ],
        contactTitle: '联系方式',
        address: '地址',
        addressContent: '广东省佛山市顺德区乐从镇辉煌供销社大厦 2 座 1513-1516 室',
        phone: '电话',
        phoneContent: '+86 18126679031',
        email: '邮箱',
        emailContent: 'onespacecn@gmail.com',
        formName: '姓名',
        formEmail: '电子邮箱',
        formComment: '留言内容',
        formSubmit: '提交申请',
        afterSalesTitle: '售后 服务',
        afterSalesItems: [
            {
                title: '储物柜安装',
                desc: '专业的现场安装与维护服务，确保海外项目完美落地的每一个细节。'
            },
            {
                title: '书桌安装',
                desc: '通过我们的全球合作伙伴网络，提供本土化的售后团队支持与技术咨询。'
            },
            {
                title: '办公桌安装',
                desc: '凭借多年的跨境交付经验，为每一个项目提供长期的质量保证与维护计划。'
            }
        ],
        quoteForm: {
            title: '获取 报价',
            subtitle: '项目申请表',
            projectName: '项目名称',
            projectType: '项目类型',
            projectArea: '项目面积',
            acceptPrice: '预估价格',
            projectNote: '项目备注',
            contactEmail: '联系邮箱',
            phoneWhatsapp: '手机 / WhatsApp',
            country: '国家',
            placeholderName: '请输入项目名称',
            placeholderType: '请选择项目类型',
            placeholderArea: '请输入项目面积',
            placeholderPrice: '请输入预估价格',
            placeholderNote: '请提供项目描述内容',
            placeholderCountry: '请输入国家或选择',
            placeholderEmail: '请输入您的邮箱地址',
            placeholderPhone: '请输入手机或 WhatsApp',
            successTitle: '报价成功',
            successSubtitle: '窗口将自动关闭...',
            invalidEmail: '邮箱格式错误',
            invalidPhone: '手机号码格式错误，请使用国际格式（如：+86123456789）',
            submitError: '提交报价失败，请重试。',
            generalError: '发生错误，请重试。',
            cancel: '取消',
            submit: '立即提交',
            currency: 'RMB',
            types: ['别墅 (Villa)', '公寓 (Apartment)', '酒店 (Hotel)', '学校 (School)'],
            step1Label: '基本信息',
            step2Label: '项目信息',
            step3Label: '补充信息',
            next: '下一步',
            back: '上一步',
        },
        processPage: {
            hero: {
                title: '一站式交付流程',
                desc: '我们处理从产品生产控制与检验、跨境物流运输、目的港清关纳税，到海外最终交付的整个流程。这使您可以轻松接收货物！'
            },
            title: '覆盖全流程的一站式服务',
            steps: [
                {
                    title: '产品检验与验证',
                    desc: '检验可以验证产品质量、规格和数量是否符合合同协议。检验可以检查货物是否符合进口国的法律法规、安全和环保规范。检验可以提前发现缺陷和包装问题，降低退换货风险，加速清关流程。'
                },
                {
                    title: '跨境物流运输',
                    desc: '对于海外客户购买的家具或家居用品，我们提供专业的定制化跨境物流咨询服务。高效、便捷、安全的跨境物流运输服务是我们为客户打造的核心服务内容。'
                },
                {
                    title: '目的港清关与纳税',
                    desc: '确保货物合规，即海关审核单证并查验货物，确认其符合进口国的安全、卫生、环保和质量标准。通过计算和征收关税、增值税和其他税费来调节贸易平衡。确保财政收入平衡和贸易监管。'
                },
                {
                    title: '海外末端配送',
                    desc: '对于海外客户购买的家具或家居用品，我们与当地专业物流团队合作提供专属配送服务。在海外和配送阶段，支持物流轨迹实时追踪。我们提供送货上门服务，并在交付后协助客户进行现场检验。'
                },
                {
                    title: '送货上门安装',
                    desc: '对于海外客户购买的家具和家居用品，我们提供专业的上门安装服务，简化大件家具组装流程。专业安装团队按标准化流程操作，避免非专业组装造成的损坏。现场安装同时提供使用指导，可与目的国合规要求协调。'
                }
            ],
            cta: {
                line1: '请发送您的项目详情，我们将在 24 小时内与您联系',
                line2: '如需快速获取报价，请随时通过 WhatsApp 联系我们：+86 18126679031',
                button: '立即咨询'
            }
        },
        serviceTypePage: {
            hero: {
                title: '中国家具/家居用品及建材之旅：一站式服务',
                desc: '我们将安排经验丰富的项目经理陪同您在佛山的整个行程。根据您的预算和风格要求，我们将协助您选择最合适的家具和软装配套，优化采购计划，帮您有效控制成本。同时，您还可以享受我们合作独家经销商提供的专属折扣价格。'
            },
            serviceTypes: {
                title: 'ONE SPACE 服务类别',
                items: {
                    softFurnishing: '软装设计',
                    interior: '室内设计',
                    architectural: '建筑设计',
                    landscape: '景观规划',
                    procurement: '全球采购',
                    logistics: '国际物流',
                    installation: '现场安装'
                },
                descriptions: {
                    softFurnishing: '软装设计通过克制有序的搭配，让空间在每个细节上更优雅、温润且平衡。',
                    interior: '通过比例与材质塑造层次与质感，让空间在视觉上宁静舒适，久住不厌。',
                    architectural: '建筑设计借由结构与光影勾勒形体，让空间在克制中更具力量与温度。',
                    landscape: '景观规划以植物与动线织就秩序，让自然在城市中优雅生长。',
                    procurement: '全球采购精选高质量来源与稳定供应链，兼顾品质与效率。',
                    logistics: '国际物流跨越山海高效衔接，确保每一次交付准时抵达。',
                    installation: '现场安装严格按图精准落位，确保完美贴合，完整呈现空间效果。'
                }
            },
            guarantee: {
                title: '质量 保证',
                subtitle: '我们在您的采购与交付全流程中提供行业领先的质量保障。',
                quickResponse: {
                    title: '快速响应',
                    desc: '公司建立了三级售后响应机制，72小时内可解决90%以上的问题。'
                },
                traceability: {
                    title: '质量可追溯性',
                    desc: '利用区块链技术实现材料全流程溯源，质量数据自动生成电子报告，方便客户查阅。'
                },
                optimization: {
                    title: '持续优化',
                    desc: '每季度收集客户反馈，制定改进计划。'
                }
            },
            summaryCard: {
                title: '诚信与卓越',
                desc: '从设计到交付，贯通全链路，为您的高端项目保驾护航。',
                cta: '立即咨询'
            }
        },
        casesPage: {
            heroTitle: '系统化服务需要专业团队的支持',
            heroSubtitle: '对于每个项目，我们都会匹配一对一的专业人员进行实施。',
            categories: {
                villa: '别墅类型',
                apartment: '公寓类型',
                hotel: '酒店类型',
                school: '学校类型'
            },
            items: {
                villa1: { title: '新中式别墅', subtitle: '2000m² / 慕尼黑, 德国' },
                villa2: { title: '欧式别墅', subtitle: '1000m² / 比利时' },
                villa3: { title: '简约雅致别墅', subtitle: '400m² / 巴黎, 法国' },
                apt1: { title: '都柏林学生公寓', subtitle: '100m² / 都柏林, 爱尔兰' },
                apt2: { title: '马德里公寓', subtitle: '100m² / 马德里, 西班牙' },
                apt3: { title: '雅典公寓', subtitle: '100m² / 雅典, 希腊' },
                hotel1: { title: '罗马贵族酒店', subtitle: '5000m² / 罗马, 意大利' },
                hotel2: { title: '里加别墅酒店', subtitle: '100m² / 里加, 拉脱维亚' },
                hotel3: { title: '布拉格音乐酒店', subtitle: '100m² / 布拉格, 捷克' },
                school1: { title: '摩纳哥高中', subtitle: '100m² / 摩纳哥' },
                school2: { title: '维也纳大学', subtitle: '100m² / 维也纳, 奥地利' },
                school3: { title: '伯尔尼大学', subtitle: '100m² / 伯尔尼, 瑞士' }
            },
            cta: {
                line1: '请发送您的项目详情，我们将在 24 小时内与您联系',
                line2: '如需快速获取报价，请随时通过 WhatsApp 联系我们：+86 18126679031'
            },
            viewMore: '查看更多 >',
            viewMoreMessage: '此功能暂无开发',
        },
        faqPage: {
            title: '网站常见问题 (公开版) 澳洲与中东',
            subtitle: '本 FAQ 章节针对业主最关心的核心问题进行解答，旨在建立信任并引导客户进行直接咨询。仅展示关键问题以避免信息过载。',
            categories: {
                general: '通用 | 公司与信任',
                products: '产品与定制',
                services: '服务与流程',
                shipping: '物流与安装',
                afterSales: '售后支持'
            },
            ctas: {
                general: '如果您想评估我们是否是合适的合作伙伴，请联系我们的顾问团队',
                products: '如需详细的产品和风格建议，我们的顾问很乐意为您提供帮助。',
                services: '请联系我们的团队，了解哪种服务模式适合您的项目。',
                shipping: '物流和安装详情因项目而异。请咨询我们的团队寻求指导。',
                afterSales: '关于售后流程和支持范围，我们的顾问随时待命。'
            },
            ctaTitle: '请发送您的项目详情，我们将在 24 小时内与您联系',
            ctaSubtitle: '如需快速获取报价，请随时通过 WhatsApp 联系我们：+86 18126679031',
            demoFaqs: [
                {
                    category: 'general',
                    question: '你们是谁，擅长什么？',
                    answer: '我们是一家综合性的家具采购和制造公司，拥有超过 10 年的经验，专注于住宅家具解决方案。'
                },
                {
                    category: 'general',
                    question: '你们有服务澳洲和中东地区的经验吗？',
                    answer: '是的。这些是我们的核心市场，拥有成熟的交付流程 and 当地服务经验。'
                },
                {
                    category: 'general',
                    question: '你们直接与业主合作吗？',
                    answer: '是的。我们主要支持业主，帮助他们管理复杂的海外家具项目。'
                },
                {
                    category: 'general',
                    question: '预算不确定也可以咨询吗？',
                    answer: '可以。我们会根据风格、面积与交付范围给出预算区间建议，帮助您建立合理预期。'
                },
                {
                    category: 'products',
                    question: '定制家具对海外业主来说安全吗？',
                    answer: '风险通过确认图纸、材质和规格进行管控。所有细节在生产开始前都会经过深度确认。'
                },
                {
                    category: 'products',
                    question: '你们能在一个项目中提供多种家具风格吗？',
                    answer: '是的。我们支持在一个项目中实现现代、意大利、法国和当代中式风格。'
                },
                {
                    category: 'products',
                    question: '你们如何确保产品质量？',
                    answer: '质量控制通过严格的材质筛选、生产跟进和出货前多重质检来保障。'
                },
                {
                    category: 'services',
                    question: '除了家具供应，你们还提供什么服务？',
                    answer: '我们支持采购协调、生产辅助、物流规划和现场安装指导。'
                },
                {
                    category: 'services',
                    question: '项目可以远程完成吗？',
                    answer: '是的。大多数客户通过结构化的沟通远程完成整个流程。'
                },
                {
                    category: 'services',
                    question: '我可以去中国选样吗？',
                    answer: '当然。如果客户愿意，非常欢迎在生产前亲自到场选样。'
                },
                {
                    category: 'services',
                    question: '项目周期通常如何评估？',
                    answer: '我们按“清单确认 → 生产 → QC → 运输 → 到场”拆解周期，并基于现场节点给出排期建议。'
                },
                {
                    category: 'shipping',
                    question: '你们负责往澳洲和中东的发货吗？',
                    answer: '是的。我们熟悉这两个地区的出口包装标准和物流协调。'
                },
                {
                    category: 'shipping',
                    question: '你们提供安装支持吗？',
                    answer: '我们在部分地区提供当地安装支持，或由专业团队提供远程安装指导。'
                },
                {
                    category: 'shipping',
                    question: '你们如何管理交付风险？',
                    answer: '风险通过专业包装、发货计划和详尽的流程协调降至最低。'
                },
                {
                    category: 'shipping',
                    question: '清关与税费由谁负责？',
                    answer: '我们会根据项目所在地提供清关与税费建议，并可协同目的港伙伴完成流程。'
                },
                {
                    category: 'afterSales',
                    question: '你们提供什么样的售后支持？',
                    answer: '我们提供结构化的售后协助，拥有明确的响应机制和处理流程。'
                },
                {
                    category: 'afterSales',
                    question: '如果收货后发现问题该怎么办？',
                    answer: '我们的团队将立即评估案例，并迅速提供实用的解决方案或补件。'
                },
                {
                    category: 'afterSales',
                    question: '安装完成后你们还会继续参与吗？',
                    answer: '是的。在合理的质保期内，我们始终提供持续的技术咨询和维护支持。'
                },
                {
                    category: 'afterSales',
                    question: '如果出现损坏或缺件怎么办？',
                    answer: '我们会基于QC证据与到货记录快速确认问题，并提供补发或维修方案。'
                }
            ]
        },
        teamPage: {
            title: '专业的服务体系成就了合作',
            desc: '并肩作战是团队的精髓。各展所长让我们走得更远。'
        },
        contactPage: {
            title: '我们始终致力于解决您的紧缺需求',
            subtitle: '服务好每一位客户是我们的宗旨。我们为您提供24小时不间断服务，您可以随时通过下方表单联系我们，我们将为您提供免费报价。',
            features: {
                oneStop: '一站式方案',
                airport: '机场接送',
                sourcing: '中国采购',
                loading: '装柜发运'
            },
            form: {
                title: '发送您的询价',
                subtitle: '发送您的报价请求，我们将为您生成包含项目所需一切内容的报价！',
                name: '姓名',
                email: '邮箱地址',
                phone: '手机号',
                country: '国家',
                projectType: '项目类型',
                description: '描述 / 现状',
                placeholderName: '请输入您的姓名',
                placeholderEmail: '请输入您的邮箱地址',
                placeholderAreaCode: '区号',
                placeholderPhone: '请输入手机号',
                placeholderCountry: '请输入您的国家',
                placeholderProjectType: '请选择项目类型',
                placeholderPropertyType: '请选择物业类型',
                placeholderExpectedTimeline: '请选择预估开始时间',
                placeholderSurfaceArea: '请选择预估面积',
                placeholderBudgetRange: '请选择预估预算',
                placeholderFloorPlanStatus: '请选择户型图 / 尺寸状态',
                placeholderDescription: '请描述您的项目需求或现状',
                placeholderRole: '请选择您的角色',
                placeholderContactMethod: '请选择联系方式',
                placeholderContactTime: '请选择最佳联系时间',
                noCountryResults: '未找到匹配国家',
                invalidEmail: '邮箱格式不正确',
                invalidPhone: '手机号格式不正确，请使用国际格式（如 +86123456789）',
                submit: '提交计划',
                submitting: '提交中...',
                success: '提交成功！我们将尽快与您联系。',
                error: '提交失败，请稍后重试。',
                cancel: '取消',
                projectTypeOptions: {
                    residential: '住宅 (Residential)',
                    commercial: '商业 (Commercial)',
                    hospitality: '酒店 (Hospitality)',
                    other: '其他 (Other)',
                    newHome: '新建项目 (New Home)',
                    renovation: '翻新 (Renovation)',
                    furniture: '仅家具 (Furniture Only)'
                },
                propertyType: '物业类型',
                propertyTypeOptions: {
                    villa: '别墅 / 独立屋',
                    apartment: '公寓',
                    other: '其他'
                },
                expectedTimeline: '预估开始时间',
                expectedTimelineOptions: {
                    ready: '随时可以开始',
                    oneToThree: '1-3 个月内',
                    threeToSix: '3-6 个月内',
                    unknown: '暂无固定时间'
                },
                surfaceArea: '预估面积',
                surfaceAreaOptions: {
                    below200: '200m² 以下',
                    twoToFive: '200m² - 500m²',
                    above500: '500m² 以上'
                },
                budgetRange: '预估预算 (USD)',
                budgetRangeOptions: {
                    below50k: '$50,000 以下',
                    fiveToTen: '$50,000 - $100,000',
                    above100k: '$100,000 以上',
                    unknown: '暂不知晓'
                },
                floorPlanStatus: '户型图 / 尺寸',
                floorPlanStatusOptions: {
                    available: '有完整图纸',
                    basic: '仅有基本布局或尺寸',
                    none: '暂无'
                },
                role: '您的角色',
                roleOptions: {
                    owner: '业主 / 买家',
                    designer: '设计师 / 建筑师',
                    other: '其他'
                },
                contactMethod: '首选联系方式',
                contactMethodOptions: {
                    whatsapp: 'WhatsApp',
                    phone: '电话',
                    video: '视频通话',
                    email: '邮件',
                    wechat: '微信'
                },
                contactTime: '最佳联系时间',
                contactTimeOptions: {
                    morning: '上午',
                    afternoon: '下午',
                    evening: '晚上',
                    anytime: '随时'
                },
                refImage: '参考图片 (可选)',
                additionalNotes: '补充说明',
                placeholderAdditionalNotes: '请描述您的详细需求，如房屋大小、喜欢的风格、必须的家具以及任何特殊要求。',
                imageUploaded: '图片上传成功'
            }
        }
    }
}

const en = {
    // Header
    nav: {
        services: 'Services',
        product: 'Product',
        process: 'Process',
        cases: 'Case',
        faq: 'FAQ',
        team: 'Team',
        contact: 'Contact',
        home: 'Home',
        whatsapp: 'WhatsApp',
        languageLabel: 'Language',
    },
    // Hero
    hero: {
        kicker: 'HIGH-END RESIDENTIAL · ONE-STOP DELIVERY',
        title1: 'Premium Home',
        title2: 'One-Stop Delivery',
        subtitle: 'Design · Sourcing · QC · Logistics · Installation',
        learnMore: 'Learn More →',
        contactNow: 'Contact Now →',
    },
    // Why Us
    whyUs: {
        title: 'Why Choose Us',
        item1: {
            title1: 'We Translate',
            title2: 'Design Language',
            desc: 'Not language translation, but turning aesthetics into actionable standards: materials, craftsmanship, colors, dimensions, installation conditions.',
        },
        item2: {
            title1: 'We Deliver',
            title2: 'Evidence Chain',
            desc: 'Pre-shipment QC: photos, videos, confirmation records. Closed-loop issues: rework/reshipment confirmed before dispatch.',
        },
        item3: {
            title1: 'We Work by',
            title2: 'Milestones',
            title3: '',
            desc: 'Scope confirmation → Specs → Order progress → QC → Arrival plan → Installation coordination. Controllable and stress-free.',
        },
    },
    // Services
    services: {
        title: 'Core Services',
        subtitle: 'Turn design intent into deliverable results',
        items: [
            { title: 'Design Coordination', zh: 'Design Standardization', desc: 'Convert design language into actionable standards: materials, craftsmanship, colors, dimensions' },
            { title: 'Sourcing & Procurement', zh: 'Supplier Integration', desc: 'Optimal supply chain matching: budget × quality × timeline × installation conditions' },
            { title: 'QC Evidence Chain', zh: 'Quality Inspection', desc: 'Pre-shipment inspection, photo/video documentation, closed-loop issue resolution' },
            { title: 'Logistics & Delivery', zh: 'Shipping & Delivery', desc: 'Organize shipments by project milestones, matching on-site windows' },
            { title: 'Installation Readiness', zh: 'Installation Verification', desc: 'Pre-verify dimensions, walls, pipes, load-bearing, finishing conditions' },
            { title: 'Project Control', zh: 'Project Management', desc: 'Milestone tracking, change assessment, risk alerts, making complex controllable' },
        ],
    },
    // Process
    process: {
        title: 'Delivery Process',
        subtitle: 'Breaking complex delivery into confirmable, trackable milestones',
        steps: [
            { step: 'A', title: 'Scope & Standard', zh: 'Scope Confirmation', items: ['Location, timeline, style', 'Specs & boundaries', 'Budget & change rules'] },
            { step: 'B', title: 'Production & QC', zh: 'Production & Evidence', items: ['Order progress management', 'Pre-shipment QC chain', 'Issue resolution'] },
            { step: 'C', title: 'Delivery & Install', zh: 'Delivery & Installation', items: ['Container/shipping/arrival plan', 'Installation verification', 'Delivery acceptance'] },
        ],
    },
    // Coverage
    coverage: {
        title: 'Service Regions',
    },
    // Projects
    projects: {
        title: 'Project Cases',
        viewAll: 'View All →',
        placeholder: 'Case Slot',
    },
    // Team
    team: {
        title: 'Our Team',
        subtitle: 'Professional team controlling every step of delivery',
        viewAll: 'View All Members →',
        cases: 'Past Cases',
        motto: 'Service Motto',
        emptyState: 'Team members being updated...',
        ctaTitle: 'Please send us your project details.\nWe will contact you within 24 hours.',
        ctaDesc: 'If you wish to obtain the quotation quickly, please feel free to contact us via WhatsApp at:',
        contactBtn: 'Contact Us',
    },
    // FAQ
    faq: {
        title: 'FAQ',
        viewAll: 'View All →',
    },
    // Contact
    contact: {
        title: 'Ready to Start?',
        subtitle: 'Tell us your location, timeline, style reference',
        subtitle2: "We'll give you a clear execution plan",
        cta: 'WhatsApp Consultation',
    },
    // Footer
    footer: {
        tagline: 'Premium Home One-Stop Delivery',
        services: 'Services',
        resources: 'Resources',
        contact: 'Contact',
        cases: 'Cases',
        team: 'Team',
        coverage: 'Coverage',
        admin: 'Admin',
        copyright: '© 2026 ONE SPACE. All rights reserved.',
        landscape: 'Landscape Planning',
        procurement: 'Global Procurement',
        logistics: 'International Logistics',
        installation: 'On-Site Installation',
        showroomVideo: 'Showroom Video',
        aboutUs: 'About Us',
    },
    // Profile
    profile: {
        title: 'My Account',
        logout: 'Logout',
        history: 'Chat History',
        newChat: 'New Chat',
        noHistory: 'No history found',
        startFirst: 'Start your first chat →',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this chat?',
        loading: 'Loading...',
        account: 'Account Info',
        welcome: 'Hello, ',
        subtitle: 'Manage your project preferences and consultation history here.',
        reportTitle: 'One-Stop Report',
        reportDesc: 'Generating real-time delivery dashboard for your project.',
        footerTag: 'ONE SPACE · Premium Residential Delivery · Excellence in Every Detail',
    },
    // Auth
    auth: {
        login: 'Log In',
        register: 'Register',
        email: 'Email',
        phone: 'Phone',
        password: 'Password',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        loginNow: 'Log In',
        registerNow: 'Sign Up',
        welcomeBack: 'Welcome Back',
        backToHome: 'Back to Home',
        account: 'Account',
        loginSubtitle: 'Login to continue using AI Assistant',
        createAccount: 'Create Account',
        registerSubtitle: 'Register access to AI Assistant',
        byEmail: 'By Email',
        byPhone: 'By Mobile Number',
        byMobile: 'By Mobile Number',
        byEmailTab: 'By Email',
        name: 'Name',
        placeholderName: 'Full Name',
        confirmPassword: 'Confirm Password',
        placeholderConfirm: 'Confirm password',
        errorNamePassword: 'Please fill in name and password',
        errorEmailPhone: 'Please fill in email or phone',
        errorEmailFormat: 'Email format incorrect',
        errorPhoneFormat: 'Phone format incorrect',
        errorPasswordMatch: 'Passwords do not match',
        errorPasswordLength: 'Password must be at least 6 characters',
        errorRegistrationFailed: 'Registration failed, account may already exist',
        errorLoginFailed: 'Login failed, please check account and password',
        errorTryAgain: 'An error occurred, please try again later',
        forgotPassword: 'Forgot password ?',
        resetPassword: 'Reset Password',
        newPassword: 'New Password',
        verificationCode: 'Verification Code',
        getCode: 'Get Code',
        codeSent: 'Code sent',
        codeResendIn: 's to resend',
        back: 'Back',
        confirm: 'Confirm',
        signUp: 'Sign Up',
        newToOnespace: 'New to Onespace ?',
        alreadyHaveAccount: 'Already have an account?',
        passwordHint: 'Enter 6-14 letters and numbers, no spaces',
        placeholderEmail: 'Please enter the email address',
        placeholderPhone: 'Please enter your mobile number',
        placeholderCode: 'Please enter the verification code',
        countryRegionCode: 'Country/Region Code',
        resetSuccess: 'Password reset successful, please log in',
        errorCodeRequired: 'Please enter verification code',
        errorCodeInvalid: 'Invalid or expired verification code',
        errorUserNotFound: 'User not found',
        errorCodeTooFrequent: 'Too many requests, please try again later',
        termsAgreement: 'By logging in or signing up, you agree to',
        termsOfService: 'Terms of Service',
        and: 'and',
        privacyPolicy: 'Privacy Policy',
    },
    // Feedback
    feedback: {
        title: 'Feedback',
        successTitle: 'Success',
        successDesc: 'Thank you for your feedback',
        typeLabel: 'Type:',
        imageLabel: 'Image:',
        changeImage: 'Change',
        uploadHeader: 'Upload',
        descLabel: 'Desc:',
        placeholder: 'Please enter details based on the selected type',
        cancel: 'Cancel',
        submit: 'Submit',
        submitting: 'Submitting...',
        uploading: 'Uploading...',
        errorUpload: 'Image upload failed',
        errorSubmit: 'Submission failed, please try again',
    },

    // Chat Widget
    chat: {
        title: 'ONE SPACE AI Support',
        subtitle: 'Online assistance for renovation & delivery',
        myProgress: 'My Progress',
        welcome: 'Hello! I am ONE SPACE AI assistant. Click below to start or type your question.',
        tags: ['Process', 'Sourcing', 'QC Standard', 'Shipping'],
        loginPrompt: 'Login to sync chat history and get one-stop report',
        loginBtn: 'Login Now',
        placeholder: 'Type your question...',
        whatsapp: 'WhatsApp Support',
        team: 'ONE SPACE Team',
        errorBusy: 'Sorry, system is busy.',
        errorNetwork: 'Connection failed.',
    },
    // Project Case Translations (for db content)
    projectMap: {
        'Luxurious villa in London': 'Luxurious villa in London',
        'London, United Kingdom': 'London, United Kingdom',
        'Dubai luxurious European-style villa': 'Dubai luxurious European-style villa',
        'Dubai, United Arab Emirates': 'Dubai, United Arab Emirates',
        'Paris Vacation Villa': 'Paris Vacation Villa',
        'Paris, France': 'Paris, France',
        'Modern Apartment in Dublin': 'Modern Apartment in Dublin',
        'New York Penthouse': 'New York Penthouse',
        'New York, USA': 'New York, USA',
        'Aqaba Apartment': 'Aqaba Apartment',
        'Paris Apartment': 'Paris Apartment',
        'Aleppo Apartment': 'Aleppo Apartment',
        'Haifa Hotei': 'Haifa Hotel',
        'Gwneva Hotel': 'Geneva Hotel',
        'Basra Hotel': 'Basra Hotel',
        'Rome high School': 'Rome High School',
        'Al-Gaza University': 'Al-Gaza University',
        'Salem University': 'Salem University',
        'Aqaba, Jordan': 'Aqaba, Jordan',
        'Aleppo, Syria': 'Aleppo, Syria',
        'Haifa, Israel': 'Haifa, Israel',
        'Geneva, Switzerland': 'Geneva, Switzerland',
        'Basra, Iraq': 'Basra, Iraq',
        'Rome, Italy': 'Rome, Italy',
        'Gaza, Palestine': 'Gaza, Palestine',
        'Salem, Oman': 'Salem, Oman',
        'Shanghai Xintiandi Apartment': 'Shanghai Xintiandi Apartment',
        'Shanghai, China': 'Shanghai, China',
    },
    teamMap: {
        // Positions
        'Sales Project Manager': 'Sales Project Manager',
        'Design Director': 'Design Director',
        'Designer': 'Designer',
        'Product Manager': 'Product Manager',
        'Social Media Marketing Manager': 'Social Media Marketing Manager',
        'Web Manager': 'Web Manager',
        'Financial Manager': 'Financial Manager',
        'Human Resources Manager': 'Human Resources Manager',
        'General Affairs Manager': 'General Affairs Manager',

        // Working Years
        '5+ years of working experience': '5+ years of working experience',
        '6+ years of working experience': '6+ years of working experience',
        '7+ years of working experience': '7+ years of working experience',
        '8+ years of working experience': '8+ years of working experience',
        '9+ years of working experience': '9+ years of working experience',
        '10+ years of working experience': '10+ years of working experience',
        '11+ years of working experience': '11+ years of working experience',
        '12+ years of working experience': '12+ years of working experience',
        '12 years of experience in the financial industry': '12 years of experience in the financial industry',
        '6 years of order processing experience': '6 years of order processing experience',
        'Social media marketing specialist with 7+ years’ experience.': 'Social media marketing specialist with 7+ years’ experience.',

        // Responsibilities
        'Translating client ideas into actionableoutcomes, this role bridges business strategyand team execution to drive overseas projectsfrom complexity to clarity.': 'Translating client ideas into actionableoutcomes, this role bridges business strategyand team execution to drive overseas projectsfrom complexity to clarity.',
        'Working closely with overseas clients,energizing collaboration across teams, anddriving projects from initial ideas to successful,well-executed delivery.': 'Working closely with overseas clients,energizing collaboration across teams, anddriving projects from initial ideas to successful,well-executed delivery.',
        'Teamleadership,project tracking,design  prosess examine and verify.': 'Teamleadership,project tracking,design  prosess examine and verify.',
        'Responsible for delivering full-service interiordesign for overseas residential projects,managing the process from concept to finaldelivery with a strong focus on international': 'Responsible for delivering full-service interiordesign for overseas residential projects,managing the process from concept to finaldelivery with a strong focus on international',
        'Responsible for leading full-service interiordesign for overseas residential projects,overseeing the process from design strategy tofinal delivery, and ensuring a high standard of': 'Responsible for leading full-service interiordesign for overseas residential projects,overseeing the process from design strategy tofinal delivery, and ensuring a high standard of',
        'Working closely with clients and the team onoverseas residential projects, turning designideas into well-executed, real-world spacesthrough the full design process.': 'Working closely with clients and the team onoverseas residential projects, turning designideas into well-executed, real-world spacesthrough the full design process.',
        'Communicating closely with overseas clients,brainstorming with the team, and turning designideas into real, livable spaces throughout thefull design process.': 'Communicating closely with overseas clients,brainstorming with the team, and turning designideas into real, livable spaces throughout thefull design process.',
        'Collaborating closely with overseas clients andcross-functional teams to shape designconcepts and deliver full-service interiorsolutions that balance creativity, functionality': 'Collaborating closely with overseas clients andcross-functional teams to shape designconcepts and deliver full-service interiorsolutions that balance creativity, functionality',
        'Job Responsibilities: Oversee the overall procurement of all corporate products and cargo, conduct full-process quality control (QC), arrange logistics and transportation, coordinate on-site cargo installation services, and ensure the standardized and efficient operation of the entire product supply and delivery process.': 'Job Responsibilities: Oversee the overall procurement of all corporate products and cargo, conduct full-process quality control (QC), arrange logistics and transportation, coordinate on-site cargo installation services, and ensure the standardized and efficient operation of the entire product supply and delivery process.',
        'The Marketing Department is responsible for market research, brand promotion, marketing planning, and customer development and retention. It also undertakes the full process of video shooting and editing, including script creation, on-site shooting, post-production editing, special effects production, and sound and music matching, to produce promotional videos that meet marketing needs and appeal to the audience.': 'The Marketing Department is responsible for market research, brand promotion, marketing planning, and customer development and retention. It also undertakes the full process of video shooting and editing, including script creation, on-site shooting, post-production editing, special effects production, and sound and music matching, to produce promotional videos that meet marketing needs and appeal to the audience.',
        'Mainly responsible for website design and development': 'Mainly responsible for website design and development',
        'Strategic support and planning: Participate in the formulation of strategies, assess feasibility and risks from a financial perspective, and provide data and recommendations.  Budget management and control: Prepare and manage the budget, collaborate with the business to set goals, allocate resources, track deviations in execution and make corrections.  Operational analysis and decision support: Regularly analyze key indicators such as revenue, costs, profits, and cash flow, identify problems and opportunities, and support decision-making.  Risk Control and Compliance Management: Identify, assess, and monitor financial risks (such as market/credit/operational risks), formulate response measures, and ensure compliance.  Review of contract financial terms: Review the financial terms of the contract and agreement to ensure they are reasonable and legal, and to reduce contract risks.  Financial - Business Synergy: As a communication bridge between finance and business, it aims to enhance collaboration efficiency and ensure successful implementation.  Process and System Optimization: Improve financial processes, advance ERP improvements and enhance data efficiency.': 'Strategic support and planning: Participate in the formulation of strategies, assess feasibility and risks from a financial perspective, and provide data and recommendations.  Budget management and control: Prepare and manage the budget, collaborate with the business to set goals, allocate resources, track deviations in execution and make corrections.  Operational analysis and decision support: Regularly analyze key indicators such as revenue, costs, profits, and cash flow, identify problems and opportunities, and support decision-making.  Risk Control and Compliance Management: Identify, assess, and monitor financial risks (such as market/credit/operational risks), formulate response measures, and ensure compliance.  Review of contract financial terms: Review the financial terms of the contract and agreement to ensure they are reasonable and legal, and to reduce contract risks.  Financial - Business Synergy: As a communication bridge between finance and business, it aims to enhance collaboration efficiency and ensure successful implementation.  Process and System Optimization: Improve financial processes, advance ERP improvements and enhance data efficiency.',
        'Oversee the full spectrum of the company\'s human resources functions, build and implement the HR system, and support the company\'s overseas business expansion and organizational development.': 'Oversee the full spectrum of the company\'s human resources functions, build and implement the HR system, and support the company\'s overseas business expansion and organizational development.',
        'Oversees the overall operation of the company\'s administrative and general affairs, responsible for the coordination of office management, logistics support, document filing, meeting organization, visitor reception and internal and external department communication, optimizes administrative processes and controls related expenses, and provides comprehensive and efficient administrative support for the company\'s daily operation and business development.': 'Oversees the overall operation of the company\'s administrative and general affairs, responsible for the coordination of office management, logistics support, document filing, meeting organization, visitor reception and internal and external department communication, optimizes administrative processes and controls related expenses, and provides comprehensive and efficient administrative support for the company\'s daily operation and business development.'
    },
    countryMap: {
        "United Arab Emirates": "United Arab Emirates",
        "Saudi Arabia": "Saudi Arabia",
        "Qatar": "Qatar",
        "Kuwait": "Kuwait",
        "Bahrain": "Bahrain",
        "Oman": "Oman",
        "Turkey": "Turkey",
        "Israel": "Israel",
        "Jordan": "Jordan",
        "Lebanon": "Lebanon",
        "United Kingdom": "United Kingdom",
        "Germany": "Germany",
        "France": "France",
        "Italy": "Italy",
        "Spain": "Spain",
        "Netherlands": "Netherlands",
        "Switzerland": "Switzerland",
        "Sweden": "Sweden",
        "Norway": "Norway",
        "Denmark": "Denmark",
        "Finland": "Finland",
        "Belgium": "Belgium",
        "Austria": "Austria",
        "Greece": "Greece",
        "Portugal": "Portugal",
        "Ireland": "Ireland",
        "Poland": "Poland",
        "Czech Republic": "Czech Republic",
        "Hungary": "Hungary",
        "Romania": "Romania"
    },
    // New Luxury Sections
    luxury: {
        getQuote: 'Get a Quote',
        heroTitle: 'High-end Residences | One-stop Delivery',
        heroSubtitle: 'Design | Construction | Delivery',
        heroAlt: 'Luxury Residence',
        goToSlide: 'Go to slide',
        contactBgAlt: 'Contact Background',
        whyTitle: 'Why Choose ONE SPACE?',
        whyItems: [
            {
                title: 'Professional Integration',
                desc: 'Connecting the entire chain from design to delivery, simplifying complex cross-border procurement processes to bring customers an easy and convenient receiving experience.'
            },
            {
                title: 'Global Project Experience',
                desc: 'ONE SPACE has successfully served over 50 countries worldwide, completed more than 3,000 projects, and accumulated rich experience in handling cross-border business.'
            },
            {
                title: 'Main Supplier Chain',
                desc: 'Leveraging Foshan\'s advantage as the global furniture capital, carefully selecting from over 10,000 suppliers to ensure excellent product quality and competitive pricing.'
            },
            {
                title: 'Significant Cost Advantage',
                desc: 'Through scaled procurement and direct factory cooperation, saving clients 30%-50% in costs, significantly lower than local procurement prices for equivalent quality.'
            }
        ],
        advantagesTitle: 'Our advantages',
        advantagesItems: [
            'More than 10 years of exporting whole house one-stop solution experience',
            'More than 50 countries choose us',
            'More than 60 global partners',
            'More than 200 designers provide professional design service for you',
            'More than 1000 kinds of furniture and soft furnishing furniture for your choose',
            'More than 2000 construction projects'
        ],
        casesTitle: 'Completed Cases',
        cases: [
            {
                title: 'Case | Taiwanese Modern Style',
                desc: 'A minimalist approach blending traditional Oriental aesthetics with modern functionality.'
            },
            {
                title: 'European-style Wooden Paradigm',
                desc: 'Exceptional wood craftsmanship creating a warm, timeless atmosphere in a tropical setting.'
            }
        ],
        contactTitle: 'Contact Us',
        address: 'Address',
        addressContent: 'Room 1513-1516, Block 2, Huihuang Supply and Marketing Cooperative Building, Lecong Town, Shunde District, Foshan City, Guangdong Province',
        phone: 'Phone',
        phoneContent: '+86 18126679031',
        email: 'Email',
        emailContent: 'onespacecn@gmail.com',
        formName: 'Name',
        formEmail: 'Email',
        formComment: 'Comment',
        formSubmit: 'Submit Request',
        afterSalesTitle: 'After-sales service',
        afterSalesItems: [
            {
                title: 'Storage cabinet installation',
                desc: 'Professional on-site installation and maintenance services to ensure every detail of overseas projects falls perfectly.'
            },
            {
                title: 'Desk installation',
                desc: 'Provide localized after-sales team support and technical consultation through our network of global partners.'
            },
            {
                title: 'Office desk installation',
                desc: 'With years of cross-border delivery experience, providing long-term quality assurance and maintenance plans for every project.'
            }
        ],
        quoteForm: {
            title: 'Get quote',
            subtitle: 'PROJECT REQUEST FORM',
            projectName: 'Project Name',
            projectType: 'Project Type',
            projectArea: 'Project Area',
            acceptPrice: 'Accept Price',
            projectNote: 'Project Note',
            contactEmail: 'Contact Email',
            phoneWhatsapp: 'Phone / Whatsapp',
            country: 'Country',
            placeholderName: 'Please enter project name',
            placeholderType: 'Please select project type',
            placeholderArea: 'Please enter project area',
            placeholderPrice: 'Please enter Accept Price',
            placeholderNote: 'Please provide the project description content.',
            placeholderCountry: 'Please enter or select country',
            placeholderEmail: 'your@email.com',
            placeholderPhone: '+86...',
            successTitle: 'Quotation successful',
            successSubtitle: 'Window will close automatically...',
            invalidEmail: 'Invalid email format',
            invalidPhone: 'Invalid phone number. Use international format (e.g. +86123456789)',
            submitError: 'Failed to submit quote. Please try again.',
            generalError: 'An error occurred. Please try again.',
            cancel: 'Cancel',
            submit: 'Submit Now',
            currency: 'RMB',
            types: ['Villa', 'Apartment', 'Hotel', 'School'],
            step1Label: 'Basic Info',
            step2Label: 'Project Info',
            step3Label: 'Additional Info',
            next: 'Next',
            back: 'Back',
        },
        processPage: {
            hero: {
                title: 'One-stop delivery process',
                desc: 'We handle the entire process from product production control and inspection, cross-border logistics transportation, customs clearance and tax payment at the destination port, to overseas final delivery. This enables you to receive your goods effortlessly!'
            },
            title: 'One-stop service covering the entire process',
            steps: [
                {
                    title: 'Product inspection and verification',
                    desc: 'Inspection can verify whether the product quality, specifications and quantity comply with the contractual agreements. Inspection can check whether the goods comply with the laws, regulations, safety and environmental protection norms of the importing country. Inspection can detect defects and packaging problems in advance.'
                },
                {
                    title: 'Cross-border logistics transportation',
                    desc: 'For furniture or home furnishings purchased by overseas customers, we offer professional customized cross-border logistics consulting services. Efficient, convenient and safe cross-border logistics transportation services are the core service content we have created for overseas customers.'
                },
                {
                    title: 'Destination port customs clearance and tax payment',
                    desc: 'Ensure that the goods are compliant, that is, the customs review the documents and inspect the goods to confirm that they meet the safety, hygiene, environmental protection and quality standards of the importing country. Collect tariffs and taxes to adjust the trade balance and provide fiscal revenue.'
                },
                {
                    title: 'Overseas end delivery',
                    desc: 'For furniture or home goods purchased by overseas customers, we collaborate with local professional logistics teams to provide exclusive end delivery services. During the overseas and delivery stage, real-time tracking of logistics trajectories is supported. We offer furniture or home goods delivery to the customer\'s doorstep.'
                },
                {
                    title: 'Door-to-door installation',
                    desc: 'For furniture and home goods purchased by overseas customers, we offer professional on-site installation services, simplifying the assembly process of large furniture items. The professional installation team operates according to standardized procedures, avoiding damage caused by non-professional assembly.'
                }
            ],
            cta: {
                line1: 'Please send us your project details. We will contact you within 24 hours.',
                line2: 'If you wish to obtain the quotation quickly, please feel free to contact us via WhatsApp at: +86 18126679031.',
                button: 'Contact now'
            }
        },
        serviceTypePage: {
            hero: {
                title: 'China Furniture/Household Goods and Building Materials Tour: One-stop Service',
                desc: 'We will arrange an experienced project manager to accompany you throughout your visit to Foshan - known as the "World Capital of Furniture". Based on your budget and style requirements, we will assist you in selecting the most suitable furniture and soft furnishings to match, optimize the procurement plan, and help you effectively control costs. At the same time, you can also enjoy the exclusive discount prices offered by our cooperative exclusive dealers.'
            },
            serviceTypes: {
                title: 'Onespace service type',
                items: {
                    softFurnishing: 'Soft Furnishing Design',
                    interior: 'Interior Design',
                    architectural: 'Architectural Design',
                    landscape: 'Landscape Planning',
                    procurement: 'Global Procurement',
                    logistics: 'International Logistics',
                    installation: 'On-Site Installation'
                },
                descriptions: {
                    softFurnishing: 'Soft furnishing design makes the space more elegant, warmer and perfectly balanced in every aspect, through restraint.',
                    interior: 'Using proportions and materials to create texture, the space becomes serene and pleasing to the eye, making it comfortable to live in for a long time without getting tiresome.',
                    architectural: 'Architectural design uses structure and light to outline the shape, making the space more powerful and warm in restraint.',
                    landscape: 'Landscape planning weaves order through plants and pathways, allowing nature to grow gracefully in the city.',
                    procurement: 'National procurement, carefully selecting high-quality sources and stable supply, ensuring both quality and efficiency.',
                    logistics: 'International logistics, seamlessly connecting across mountains and seas, ensures that every delivery arrives on time.',
                    installation: 'On-site installation, precise alignment according to the drawings to achieve a perfect fit, allowing the space to be fully displayed.'
                }
            },
            guarantee: {
                title: 'Quality Guarantee',
                subtitle: 'We provide industry-leading quality assurance across every phase of your procurement journey.',
                quickResponse: {
                    title: 'Quick Response',
                    desc: 'The company has established a three-level after-sales response mechanism, which can solve more than 90% of the problems within 72 hours.'
                },
                traceability: {
                    title: 'Quality Traceability',
                    desc: 'The whole traceability of materials is realized by using the technology of blockchain, and the quality data is automatically generated into electronic report for the convenience of the customer.'
                },
                optimization: {
                    title: 'Continuous Optimization',
                    desc: 'The customer feedback is collected every quarter to form the improvement plan.'
                }
            },
            summaryCard: {
                title: 'Integrity & Excellence',
                desc: 'Connecting the entire chain from design to delivery for your luxury project.',
                cta: 'Discuss now'
            }
        },
        casesPage: {
            heroTitle: 'Systematic services require the support of a professional team',
            heroSubtitle: 'For each project, we will match one-on-one professionals for its implementation.',
            categories: {
                villa: 'Villa-type',
                apartment: 'Apartment type',
                hotel: 'Hotel type',
                school: 'School type'
            },
            items: {
                villa1: { title: 'New Chinese-style villa', subtitle: '2000m² / Munich, Germany' },
                villa2: { title: 'European-style villa', subtitle: '1000m² / Belgian Rome' },
                villa3: { title: 'Simple and elegant villa', subtitle: '400m² / Paris, France' },
                apt1: { title: 'Dublin Student Apartments', subtitle: '100m² / Dublin, Ireland' },
                apt2: { title: 'Madrid Apartment', subtitle: '100m² / Madrid, Spain' },
                apt3: { title: 'Athens Apartment', subtitle: '100m² / Athens, Greece' },
                hotel1: { title: 'Roman Aristocrat Hotel', subtitle: '5000m² / Rome, Italy' },
                hotel2: { title: 'Riga Villa Hotel', subtitle: '100m² / Riga, Latvia' },
                hotel3: { title: 'Prague Music Hotel', subtitle: '100m² / Prague, Czech Republic' },
                school1: { title: 'Monaco High School', subtitle: '100m² / Monaco Monaco City' },
                school2: { title: 'University of Vienna', subtitle: '100m² / Vienna, Austria' },
                school3: { title: 'University of Bern', subtitle: '100m² / Bern, Switzerland' }
            },
            cta: {
                line1: 'Please send us your project details. We will contact you within 24 hours.',
                line2: 'If you wish to obtain the quotation quickly, please feel free to contact us via WhatsApp at: +86 18126679031.',
            },
            viewMore: 'View More >',
            viewMoreMessage: 'This feature is currently under development',
        },
        faqPage: {
            title: 'Website FAQ (Public Version) Australia & Middle East',
            subtitle: 'This FAQ section addresses the most important homeowner concerns, builds trust, and guides qualified clients to direct consultation. Only key questions are displayed publicly to avoid information overload.',
            categories: {
                general: 'General | Company & Trust',
                products: 'Products & Customization',
                services: 'Services & Process',
                shipping: 'Shipping & Installation',
                afterSales: 'After-Sales Support'
            },
            ctas: {
                general: 'If you would like to evaluate whether we are the right partner, please contact our consultant team',
                products: 'For detailed product and style recommendations, our consultants are happy to assist.',
                services: 'Please contact our team to understand which service model suits your project.',
                shipping: 'Shipping and installation details vary by project. Please consult our team for guidance.',
                afterSales: 'For after-sales procedures and support scope, our consultants are available to assist.'
            },
            ctaTitle: 'Please send us your project details. We will contact you within 24 hours.',
            ctaSubtitle: 'If you wish to obtain the quotation quickly, please feel free to contact us via WhatsApp at: +86 18126679031.',
            demoFaqs: [
                {
                    category: 'general',
                    question: 'Who are you and what do you specialize in?',
                    answer: 'We are a furniture sourcing and manufacturing integrated company with over 10 years of experience, focused on residential furniture solutions.'
                },
                {
                    category: 'general',
                    question: 'Do you have experience serving Australia and the Middle East?',
                    answer: 'Yes. These are our core markets, supported by mature delivery processes and local service experience.'
                },
                {
                    category: 'general',
                    question: 'Do you work directly with homeowners?',
                    answer: 'Yes. We primarily support homeowners and help them manage complex overseas furniture projects.'
                },
                {
                    category: 'general',
                    question: 'Can I consult even if my budget is not fixed?',
                    answer: 'Yes. We provide a budget range based on style, area, and delivery scope to set expectations.'
                },
                {
                    category: 'products',
                    question: 'Is custom furniture safe for overseas homeowners?',
                    answer: 'Risks are managed through confirmed drawings, materials, and specifications before production begins.'
                },
                {
                    category: 'products',
                    question: 'Can you provide multiple furniture styles in one project?',
                    answer: 'Yes. We support modern, Italian, French, and contemporary Chinese styles within one project.'
                },
                {
                    category: 'products',
                    question: 'How do you ensure product quality?',
                    answer: 'Quality is controlled through material selection, production follow-up, and pre-shipment checks.'
                },
                {
                    category: 'services',
                    question: 'What services do you provide beyond furniture supply?',
                    answer: 'We support sourcing coordination, production follow-up, logistics planning, and installation guidance.'
                },
                {
                    category: 'services',
                    question: 'Can the project be completed remotely?',
                    answer: 'Yes. Most clients complete the entire process remotely with structured communication.'
                },
                {
                    category: 'services',
                    question: 'Can I visit China for product selection?',
                    answer: 'Yes. Clients are welcome to visit China for on-site selection if preferred.'
                },
                {
                    category: 'services',
                    question: 'How do you estimate the project timeline?',
                    answer: 'We break the timeline into scope confirmation, production, QC, shipping, and site coordination.'
                },
                {
                    category: 'shipping',
                    question: 'Do you handle shipping to Australia and the Middle East?',
                    answer: 'Yes. We are familiar with export packaging standards and shipping coordination for both regions.'
                },
                {
                    category: 'shipping',
                    question: 'Do you provide installation support?',
                    answer: 'We provide local installation support where available or professional remote guidance.'
                },
                {
                    category: 'shipping',
                    question: 'How do you manage delivery risks?',
                    answer: 'Delivery risks are managed through professional packaging and process coordination.'
                },
                {
                    category: 'shipping',
                    question: 'Who handles customs clearance and taxes?',
                    answer: 'We provide guidance based on destination requirements and can coordinate with local partners.'
                },
                {
                    category: 'afterSales',
                    question: 'What kind of after-sales support do you provide?',
                    answer: 'We provide structured after-sales assistance with defined response processes.'
                },
                {
                    category: 'afterSales',
                    question: 'What should I do if an issue occurs after delivery?',
                    answer: 'Our team will review the case and assist with a practical solution.'
                },
                {
                    category: 'afterSales',
                    question: 'Will you stay involved after installation?',
                    answer: 'Yes. We remain available for reasonable post-installation support.'
                },
                {
                    category: 'afterSales',
                    question: 'What if there is damage or missing items?',
                    answer: 'We verify with QC evidence and delivery records, then arrange replacement or repair.'
                }
            ]
        },
        teamPage: {
            title: 'Team Members',
            desc: 'Working side by side is the essence of a team. Each having their own strengths leads us to go further.'
        },
        contactPage: {
            title: 'We are always there to address your urgent needs',
            subtitle: 'Serving our customers well is our principle. We offer 24-hour service to you. You can contact us at any time via the form below and we will provide you with a free quote.',
            features: {
                oneStop: 'One-Stop Solution',
                airport: 'Airport Pick up',
                sourcing: 'Sourcing in China',
                loading: 'Container Load & Shipment'
            },
            form: {
                title: 'Send Your Inquiry',
                subtitle: 'Send us your request for quotation and we will generate a quote with everything you need for your project!',
                name: 'Name',
                email: 'Email Address',
                phone: 'Phone',
                country: 'Country',
                projectType: 'Project Type',
                description: 'Description',
                placeholderName: 'Enter your name',
                placeholderEmail: 'Enter your email address',
                placeholderAreaCode: 'Area Code',
                placeholderPhone: 'Enter phone number',
                placeholderCountry: 'Enter your country',
                placeholderProjectType: 'Select project type',
                placeholderPropertyType: 'Select property type',
                placeholderExpectedTimeline: 'Select expected timeline',
                placeholderSurfaceArea: 'Select surface area',
                placeholderBudgetRange: 'Select budget range',
                placeholderFloorPlanStatus: 'Select floor plan status',
                placeholderDescription: 'Describe your project needs or current situation',
                placeholderRole: 'Select your role',
                placeholderContactMethod: 'Select contact method',
                placeholderContactTime: 'Select best time to contact',
                noCountryResults: 'No country found',
                invalidEmail: 'Invalid email format',
                invalidPhone: 'Invalid phone number. Use international format (e.g. +86123456789)',
                submit: 'Submit Now',
                submitting: 'Submitting...',
                success: 'Submitted successfully! We will contact you soon.',
                error: 'Submission failed, please try again later.',
                cancel: 'Cancel',
                projectTypeOptions: {
                    residential: 'Residential',
                    commercial: 'Commercial',
                    hospitality: 'Hospitality',
                    other: 'Other',
                    newHome: 'Construction / New Home Project',
                    renovation: 'Renovation / Existing Home Upgrade',
                    furniture: 'Furniture Only (No construction)'
                },
                propertyType: 'Property Type',
                propertyTypeOptions: {
                    villa: 'Villa / House',
                    apartment: 'Apartment / Condo',
                    other: 'Other'
                },
                expectedTimeline: 'Expected Start Timeline',
                expectedTimelineOptions: {
                    ready: 'Ready to start now',
                    oneToThree: 'Within 1–3 months',
                    threeToSix: 'Within 3–6 months',
                    unknown: 'No fixed timeline yet'
                },
                surfaceArea: 'Estimated Surface Area',
                surfaceAreaOptions: {
                    below200: 'Below 200m²',
                    twoToFive: '200m² to 500m²',
                    above500: 'Above 500m²'
                },
                budgetRange: 'Estimated Budget Range (USD)',
                budgetRangeOptions: {
                    below50k: 'Below $50,000',
                    fiveToTen: '$50,000 – $100,000',
                    above100k: 'Over $100,000',
                    unknown: 'Prefer not to say yet'
                },
                floorPlanStatus: 'Floor Plan / Measurements',
                floorPlanStatusOptions: {
                    available: 'Complete drawings available',
                    basic: 'Basic layout or measurements only',
                    none: 'Not available yet'
                },
                role: 'Your Role',
                roleOptions: {
                    owner: 'Property Owner / Buyer',
                    designer: 'Designer / Architect',
                    other: 'Other'
                },
                contactMethod: 'Preferred Contact Method',
                contactMethodOptions: {
                    whatsapp: 'WhatsApp',
                    phone: 'Phone call',
                    video: 'Video call',
                    email: 'Email',
                    wechat: 'WeChat'
                },
                contactTime: 'Best Time to Contact',
                contactTimeOptions: {
                    morning: 'Morning',
                    afternoon: 'Afternoon',
                    evening: 'Evening',
                    anytime: 'Anytime'
                },
                refImage: 'Ref Image (Optional)',
                additionalNotes: 'Additional Notes',
                placeholderAdditionalNotes: 'Please describe your details such as the size of the house, your preferred style, the furniture you must have, and any special requirements.',
                imageUploaded: 'Image uploaded successfully'
            }
        }
    }
}

export const translations = {
    zh,
    en,
}

export function getTranslation(locale: Locale) {
    return translations[locale]
}
