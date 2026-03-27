'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import QuoteModal from '@/components/QuoteModal'

interface QuoteModalContextType {
    openQuoteModal: () => void
    closeQuoteModal: () => void
}

const QuoteModalContext = createContext<QuoteModalContextType | undefined>(undefined)

import { useAuth } from '@/lib/AuthContext'

export function QuoteModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const { requireAuth } = useAuth()

    const openQuoteModal = () => {
        requireAuth(() => {
            setIsOpen(true)
        })
    }
    const closeQuoteModal = () => setIsOpen(false)

    return (
        <QuoteModalContext.Provider value={{ openQuoteModal, closeQuoteModal }}>
            {children}
            <QuoteModal isOpen={isOpen} onClose={closeQuoteModal} />
        </QuoteModalContext.Provider>
    )
}

export function useQuoteModal() {
    const context = useContext(QuoteModalContext)
    if (context === undefined) {
        throw new Error('useQuoteModal must be used within a QuoteModalProvider')
    }
    return context
}
