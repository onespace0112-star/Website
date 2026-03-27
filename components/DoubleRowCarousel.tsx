'use client'

import React from 'react'

type CarouselItem = {
    image: string
    title?: string
}

interface DoubleRowCarouselProps {
    items: CarouselItem[]
}

export default function DoubleRowCarousel({ items }: DoubleRowCarouselProps) {
    const [paused, setPaused] = React.useState(false)

    if (!items || items.length === 0) {
        return null
    }

    const rowItems = items.concat(items)

    return (
        <div
            className={`double-row-carousel ${paused ? 'is-paused' : ''}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            <div className="double-row-carousel__row">
                <div className="double-row-carousel__track">
                    {rowItems.map((item, index) => (
                        <div className="double-row-carousel__card" key={`row-1-${index}`}>
                            <img src={item.image} alt={item.title || 'Gallery'} loading="lazy" decoding="async" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="double-row-carousel__row">
                <div className="double-row-carousel__track double-row-carousel__track--reverse">
                    {rowItems.map((item, index) => (
                        <div className="double-row-carousel__card" key={`row-2-${index}`}>
                            <img src={item.image} alt={item.title || 'Gallery'} loading="lazy" decoding="async" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
