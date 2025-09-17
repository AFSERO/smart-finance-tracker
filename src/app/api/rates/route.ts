import { NextRequest, NextResponse } from 'next/server'
import { fetchRates } from '@/services/ratesService'

export async function GET(_req: NextRequest) {
  try {
    const data = await fetchRates()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Rates proxy error:', error)
    // Return empty object to avoid breaking UI; callers can treat missing keys as unavailable
    return NextResponse.json({}, { status: 200 })
  }
}


