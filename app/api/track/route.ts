import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const response = await fetch('https://api.logsnag.com/v1/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOGSNAG_TOKEN}`,
      },
      body: JSON.stringify({
        project: process.env.LOGSNAG_PROJECT,
        channel: process.env.LOGSNAG_CHANNEL,
        ...body,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}