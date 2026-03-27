'use client'

import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { usePathname } from 'next/navigation'

export default function AOSInit() {
    const pathname = usePathname()

    const shouldDisableAOS = () => {
        if (typeof window === 'undefined') return true
        return window.innerWidth < 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    const revealAllAosElements = () => {
        if (typeof document === 'undefined') return
        document.querySelectorAll('[data-aos]').forEach((el) => {
            el.classList.add('aos-animate')
        })
    }

    useEffect(() => {
        if (shouldDisableAOS()) {
            revealAllAosElements()
            const observer = new MutationObserver(() => {
                revealAllAosElements()
            })
            observer.observe(document.body, { childList: true, subtree: true })
            const t = window.setTimeout(revealAllAosElements, 0)
            return () => {
                window.clearTimeout(t)
                observer.disconnect()
            }
        }

        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            mirror: false,
            disable: shouldDisableAOS
        })

        const t = window.setTimeout(() => {
            AOS.refreshHard()
        }, 0)

        return () => {
            window.clearTimeout(t)
        }
    }, [])

    useEffect(() => {
        const t = window.setTimeout(() => {
            if (shouldDisableAOS()) {
                revealAllAosElements()
                return
            }
            AOS.refreshHard()
        }, 0)

        return () => {
            window.clearTimeout(t)
        }
    }, [pathname])

    return null
}
