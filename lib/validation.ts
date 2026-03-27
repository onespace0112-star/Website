export const validateEmail = (email: string): boolean => {
    const trimmed = email.trim()
    if (!trimmed) return false
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed)
}

export const normalizePhone = (phone: string): string => {
    if (!phone) return ''
    let cleaned = phone.trim()
    // Remove separators: space - ( ) .
    cleaned = cleaned.replace(/[\s\-\(\)\.]/g, '')
    // Handle international prefix 00 -> +
    if (cleaned.startsWith('00')) {
        cleaned = '+' + cleaned.substring(2)
    }
    return cleaned
}

export const validatePhone = (phone: string): boolean => {
    const normalized = normalizePhone(phone)
    return /^\+?[0-9]{8,15}$/.test(normalized)
}
