import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import TeamPageClient from '@/components/TeamPageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Focus Team | ONE SPACE',
    description: 'Professional team for your luxury home delivery.',
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
