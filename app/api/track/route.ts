import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const token = process.env.LOGSNAG_TOKEN
    const project = process.env.LOGSNAG_PROJECT
    const channel = process.env.LOGSNAG_CHANNEL

    // Debug: check if vars exist
    if (!token || !project || !channel) {
      return NextResponse.json({
        ok: false,
        error: 'Missing env vars',
        hasToken: !!token,
        hasProject: !!project,
        hasChannel: !!channel,
      }, { status: 500 })
    }

    const response = await fetch('https://api.logsnag.com/v1/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        project,
        channel,
        ...body,
      }),
    })

    const data = await response.text()

    if (!response.ok) {
      return NextResponse.json({
        ok: false,
        status: response.status,
        logsnagResponse: data,
      }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}