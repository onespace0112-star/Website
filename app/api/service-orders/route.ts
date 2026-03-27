import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/userAuth'

export const dynamic = 'force-dynamic'

const countryCodeMap: Record<string, string> = {
    '1': 'United States',
    '7': 'Russia',
    '20': 'Egypt',
    '27': 'South Africa',
    '30': 'Greece',
    '31': 'Netherlands',
    '32': 'Belgium',
    '33': 'France',
    '34': 'Spain',
    '36': 'Hungary',
    '39': 'Italy',
    '40': 'Romania',
    '41': 'Switzerland',
    '43': 'Austria',
    '44': 'United Kingdom',
    '45': 'Denmark',
    '46': 'Sweden',
    '47': 'Norway',
    '48': 'Poland',
    '49': 'Germany',
    '51': 'Peru',
    '52': 'Mexico',
    '53': 'Cuba',
    '54': 'Argentina',
    '55': 'Brazil',
    '56': 'Chile',
    '57': 'Colombia',
    '58': 'Venezuela',
    '60': 'Malaysia',
    '61': 'Australia',
    '62': 'Indonesia',
    '63': 'Philippines',
    '64': 'New Zealand',
    '65': 'Singapore',
    '66': 'Thailand',
    '81': 'Japan',
    '82': 'South Korea',
    '84': 'Vietnam',
    '86': 'China',
    '90': 'Turkey',
    '91': 'India',
    '92': 'Pakistan',
    '93': 'Afghanistan',
    '94': 'Sri Lanka',
    '95': 'Myanmar',
    '98': 'Iran',
    '212': 'Morocco',
    '213': 'Algeria',
    '216': 'Tunisia',
    '218': 'Libya',
    '220': 'Gambia',
    '234': 'Nigeria',
    '249': 'Sudan',
    '254': 'Kenya',
    '255': 'Tanzania',
    '256': 'Uganda',
    '260': 'Zambia',
    '263': 'Zimbabwe',
    '351': 'Portugal',
    '352': 'Luxembourg',
    '353': 'Ireland',
    '354': 'Iceland',
    '358': 'Finland',
    '370': 'Lithuania',
    '371': 'Latvia',
    '372': 'Estonia',
    '380': 'Ukraine',
    '381': 'Serbia',
    '385': 'Croatia',
    '386': 'Slovenia',
    '420': 'Czech Republic',
    '421': 'Slovakia',
    '852': 'Hong Kong',
    '853': 'Macau',
    '855': 'Cambodia',
    '856': 'Laos',
    '880': 'Bangladesh',
    '886': 'Taiwan',
    '960': 'Maldives',
    '961': 'Lebanon',
    '962': 'Jordan',
    '963': 'Syria',
    '964': 'Iraq',
    '965': 'Kuwait',
    '966': 'Saudi Arabia',
    '968': 'Oman',
    '971': 'UAE',
    '972': 'Israel',
    '974': 'Qatar',
    '977': 'Nepal',
    '992': 'Tajikistan',
    '993': 'Turkmenistan',
    '994': 'Azerbaijan',
    '995': 'Georgia',
    '996': 'Kyrgyzstan',
    '998': 'Uzbekistan',
}

function detectCountry(phone: string | null | undefined): string {
    if (!phone) return ''
    const digits = phone.replace(/[^0-9]/g, '')
    // Try 3-digit, 2-digit, then 1-digit country codes
    for (const len of [3, 2, 1]) {
        const code = digits.substring(0, len)
        if (countryCodeMap[code]) return countryCodeMap[code]
    }
    return ''
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Please login first' }, { status: 401 })
        }

        const body = await request.json()
        const { serviceCategory, serviceType, houseArea, fee, serviceItems, travelDate } = body

        if (!serviceCategory || !serviceType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const country = detectCountry(user.phone)

        const order = await prisma.serviceOrder.create({
            data: {
                serviceCategory,
                serviceType,
                country,
                name: user.name || '',
                contact: user.email || user.phone || '',
                houseArea: houseArea || null,
                fee: fee || '',
                serviceItems: serviceItems || '',
                travelDate: travelDate || null,
            }
        })

        return NextResponse.json({ success: true, id: order.id })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit order' }, { status: 500 })
    }
}
