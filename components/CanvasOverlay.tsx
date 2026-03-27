'use client'

import { useEffect, useRef } from 'react'

export default function CanvasOverlay() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (typeof window === 'undefined') return
        // Avoid expensive background animation on mobile or reduced-motion devices.
        if (window.innerWidth < 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return
        }

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let width = window.innerWidth
        let height = window.innerHeight

        const handleResize = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        // Particles configuration
        const particleCount = 28
        const connectionDistance = 150
        const particles: {
            x: number
            y: number
            vx: number
            vy: number
            size: number
            alpha: number
        }[] = []

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.3 + 0.1
            })
        }

        let lastScrollY = window.scrollY
        let scrollSpeed = 0

        const animate = () => {
            const currentScrollY = window.scrollY
            const diff = currentScrollY - lastScrollY
            lastScrollY = currentScrollY

            // Smoothly interpolate scroll speed effect
            scrollSpeed += (diff - scrollSpeed) * 0.1

            ctx.clearRect(0, 0, width, height)

            // Draw and update particles
            particles.forEach((p, i) => {
                // Determine movement
                p.x += p.vx
                // Particles move opposite to scroll to create depth/movement effect
                p.y += p.vy - (scrollSpeed * 0.35)

                // Wrap around edges
                if (p.x < 0) p.x = width
                if (p.x > width) p.x = 0
                if (p.y < 0) p.y = height
                if (p.y > height) p.y = 0

                // Draw particle
                ctx.fillStyle = `rgba(197, 160, 89, ${p.alpha})` // Gold
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()

                // Connect particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j]
                    const dx = p.x - p2.x
                    const dy = p.y - p2.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < connectionDistance) {
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(197, 160, 89, ${0.15 * (1 - dist / connectionDistance)})`
                        ctx.lineWidth = 0.5
                        ctx.moveTo(p.x, p.y)
                        ctx.lineTo(p2.x, p2.y)
                        ctx.stroke()
                    }
                }
            })

            requestAnimationFrame(animate)
        }

        const animationId = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[40]"
            style={{ width: '100%', height: '100vh' }}
        />
    )
}
