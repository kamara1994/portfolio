import { NextRequest, NextResponse } from 'next/server'

async function sendTelegramMessage(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return {
      ok: false,
      error: 'Missing Telegram env vars',
      hasBotToken: !!botToken,
      hasChatId: !!chatId,
    }
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  const data = await response.text()

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      telegramResponse: data,
    }
  }

  return { ok: true }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const token = process.env.LOGSNAG_TOKEN
    const project = process.env.LOGSNAG_PROJECT
    const channel = process.env.LOGSNAG_CHANNEL

    if (!token || !project || !channel) {
      return NextResponse.json({
        ok: false,
        error: 'Missing LogSnag env vars',
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
        service: 'logsnag',
        status: response.status,
        logsnagResponse: data,
      }, { status: 500 })
    }

    const telegramText = `
👀 <b>Portfolio visit</b>

📄 Page: ${body.page || '/'}
📍 Location: ${body.location || 'Unknown'}
🏢 ISP/Org: ${body.org || 'Unknown'}
🔗 Referrer: ${body.referrer || 'direct'}
📱 Device: ${body.device || 'Unknown'}
🕐 Time: ${new Date().toISOString()}
`.trim()

    const telegramResult = await sendTelegramMessage(telegramText)

    return NextResponse.json({
      ok: true,
      logsnag: true,
      telegram: telegramResult,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}