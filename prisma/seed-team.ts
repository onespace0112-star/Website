import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding team members...')

    // Clear existing team members to avoid duplicates if run multiple times
    await prisma.teamMember.deleteMany({})

    const teamMembers = [
        {
            name: 'VINCENT',
            position: 'Project Leader',
            image: '/images/team/member_1.png',
            order: 1
        },
        {
            name: 'LINNA',
            position: 'Project Director',
            image: '/images/team/member_2.png',
            order: 2
        },
        {
            name: 'LI',
            position: 'Designer',
            image: '/images/team/member_3.png',
            order: 3
        },
        {
            name: 'ALEXANDER', // Fixed generic name
            position: 'Project Director',
            image: '/images/team/member_7.png',
            order: 4
        },
        {
            name: 'SARAH',
            position: 'Project Manager',
            image: '/images/team/member_4.png',
            order: 5
        },
        {
            name: 'LOUIS', // Fixed weird name 'Lvors'
            position: 'Project Manager',
            image: '/images/team/member_5.png',
            order: 6
        },
        {
            name: 'Lucas',
            position: 'Design Manager',
            image: '/images/team/member_9.png',
            order: 7
        },
        {
            name: 'Pekky',
            position: 'Project Director',
            image: '/images/team/member_6.png',
            order: 8
        },

    ]

    for (const member of teamMembers) {
        await prisma.teamMember.create({
            data: member
        })
    }

    console.log('Team members seeded successfully.')
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
