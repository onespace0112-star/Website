import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import HomeClient from '@/components/HomeClient'

export const metadata: Metadata = {
    title: 'ONE SPACE | Premium Furniture & Home Furnishing Solutions',
    description: 'ONE SPACE is a global one-stop solution provider for luxury home furnishings, building materials, and soft furnishings. Serving villas, hotels, and commercial projects worldwide.',
}
import { serializeCarousel } from '@/lib/dto/carousel'
import { serializeArray, serializeDate } from '@/lib/dto/serialize'
import type { HomeAdvantage, HomeAfterSales, HomeCase, HomeOnespace, HomeGlobalCollect, HomeGallery } from '@prisma/client'
import './home.css'

export default async function Home() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
    },
  })

  const teamMembers = await prisma.teamMember.findMany({
    orderBy: { order: 'asc' },
    take: 6,
    select: {
      id: true,
      name: true,
      position: true,
      image: true,
      serviceMotion: true,
      cases: {
        select: {
          case: { select: { name: true } },
        },
      },
    },
  })

  // Serialize dates for client component
  const serializedProjects = projects.map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    coverImage: project.coverImage,
  }))

  const serializedTeam = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    position: m.position,
    image: m.image,
    serviceMotion: m.serviceMotion,
    pastCases: m.cases.map((c) => c.case.name).join(', '), // Simple join for now
  }))


  const homeOnespace = await prisma.homeOnespace.findMany({ orderBy: { order: 'asc' } })
  const homeGlobalCollect = await prisma.homeGlobalCollect.findMany({ orderBy: { order: 'asc' } })
  const homeGallery = await prisma.homeGallery.findMany({ orderBy: { order: 'asc' } })
  const homeAdvantages = await prisma.homeAdvantage.findMany({ orderBy: { order: 'asc' } })
  const homeAfterSales = await prisma.homeAfterSales.findMany({ orderBy: { order: 'asc' } })
  const homeCases = await prisma.homeCase.findMany({ orderBy: { order: 'asc' } })

  const serializeHomeItems = <T extends { createdAt: Date; updatedAt: Date | null }>(items: T[]) => (
    serializeArray(items, (item) => ({
      ...item,
      createdAt: serializeDate(item.createdAt)!,
      updatedAt: serializeDate(item.updatedAt),
    })) ?? []
  )

  const serializedHomeOnespace = serializeHomeItems<HomeOnespace>(homeOnespace)
  const serializedHomeGlobalCollect = serializeHomeItems<HomeGlobalCollect>(homeGlobalCollect)
  const serializedHomeGallery = serializeHomeItems<HomeGallery>(homeGallery)
  const serializedHomeAdvantages = serializeHomeItems<HomeAdvantage>(homeAdvantages)
  const serializedHomeAfterSales = serializeHomeItems<HomeAfterSales>(homeAfterSales)
  const serializedHomeCases = serializeHomeItems<HomeCase>(homeCases)

  // Fetch Carousel Items
  const carouselItems = await prisma.carousel.findMany({
    where: { isVisible: true },
    orderBy: { order: 'asc' }
  })

  const serializedCarouselItems = serializeArray(carouselItems, serializeCarousel) ?? []

  return (
    <HomeClient
      projects={serializedProjects}
      team={serializedTeam}
      homeOnespace={serializedHomeOnespace}
      homeGlobalCollect={serializedHomeGlobalCollect}
      homeGallery={serializedHomeGallery}
      homeAdvantages={serializedHomeAdvantages}
      homeAfterSales={serializedHomeAfterSales}
      homeCases={serializedHomeCases}
      carouselItems={serializedCarouselItems}
    />
  )
}
