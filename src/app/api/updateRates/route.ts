import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { tcmbService } from "@/services/tcmbService"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const result = await tcmbService.refreshAll()
    await tcmbService.updatePricedAssetsFromRates()
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update rates' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Allow GET as a convenience for manual triggering
  return POST(request)
}



