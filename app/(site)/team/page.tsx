import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import TeamPageClient from '@/components/TeamPageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '专业团队 Our Team | ONE SPACE',
    description: 'ONE SPACE 专业团队：设计师、采购专家、QC工程师、物流协调员，为高端住宅交付提供全方位保障。Meet our professional team for luxury home delivery.',
    keywords: ['专业团队', '设计师', '采购专家', 'QC工程师', 'professional team', 'ONE SPACE team'],
    alternates: { canonical: 'https://onespacecn.com/team' },
}

export default async function TeamPage() {
    const rawTeamMembers = await prisma.teamMember.findMany({
        orderBy: { order: 'asc' },
    })

    // Serialize data to avoid "Props must be serializable" error with Date objects
    const teamMembers = rawTeamMembers.map((member: (typeof rawTeamMembers)[number]) => ({
        id: member.id,
        name: member.name,
        position: member.position,
        image: member.image,
        skills: member.skills,
        order: member.order,
        workingYears: member.workingYears,
        responsibilities: member.responsibilities
    }))

    return <TeamPageClient teamMembers={teamMembers} />
}
