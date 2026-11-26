import type { NextRequest } from 'next/server'
import { tgConfigured, sendMessage, esc } from './telegram'
import { getSettings, isHushed } from './settings'
import { flag } from './format'

// 💬 Sends each PWEZA question (and the start of its answer) to the bot's chat topic.
// Hiring-related questions buzz the phone; everything else arrives silently.

const HIRING = /\b(hire|hiring|recruit|interview|available|availability|salary|rate|resume|résumé|cv|clearance|relocat|start date|full[- ]time|intern|contract|position|role|job|offer|reach|contact|email|phone|linkedin)\b/i

export async function notifyChat(req: NextRequest, question: string, answer: string, turn: number) {
  if (!tgConfigured() || !question) return
  try {
    const settings = await getSettings()
    const city = req.headers.get('x-vercel-ip-city')
    const country = req.headers.get('x-vercel-ip-country') || ''
    let place = ''
    try { place = [city && decodeURIComponent(city), country].filter(Boolean).join(', ') } catch { place = country }
    const hiring = HIRING.test(question)
    const text = [
      `💬 <b>PWEZA chat</b>${hiring ? ' · 💼 <b>hiring question</b>' : ''}${turn > 1 ? ` · message ${turn}` : ''}`,
      `❓ ${esc(question.slice(0, 600))}`,
      `🤖 <i>${esc(answer.replace(/\s+/g, ' ').slice(0, 280))}${answer.length > 280 ? '…' : ''}</i>`,
      place ? `📍 ${esc(place)} ${flag(country)}` : null,
    ].filter(Boolean).join('\n')
    await sendMessage(text, { thread: settings.topics?.chats, silent: !hiring || isHushed(settings) })
  } catch { /* alerts never break the chat */ }
}
