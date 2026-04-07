import AboutClient from '@/components/AboutClient'

export const metadata = {
    title: '关于我们 About Us | ONE SPACE',
    description: 'ONE SPACE 是一家专注高端住宅交付的全球服务团队，提供从设计到安装的全流程解决方案。Learn about ONE SPACE, a global luxury home delivery team.',
    keywords: ['ONE SPACE', '关于我们', '高端住宅', '全球交付团队', 'luxury home delivery', 'about us'],
    alternates: { canonical: 'https://onespacecn.com/about' },
}

export default function AboutPage() {
    return <AboutClient />
}
