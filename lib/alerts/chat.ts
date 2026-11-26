import type { NextRequest } from 'next/server'
import { tgConfigured, sendMessage, esc } from './telegram'
import { getSettings, isHushed } from './settings'
import { flag } from './format'
import { bump, logQuestion, once, hasDb } from './store'
import { linkChat, touch } from './live'

// 💬 Sends each PWEZA question (and the start of its answer) to the bot's chat topic.
// Hiring-related questions buzz the phone; everything else arrives silently.

const HIRING = /\b(hire|hiring|recruit|interview|available|availability|salary|rate|resume|résumé|cv|clearance|relocat|start date|full[- ]time|intern|contract|position|role|job|offer|reach|contact|email|phone|linkedin)\b/i

export async function notifyChat(req: NextRequest, question: string, answer: string, turn: number, sid?: string) {
  if (!tgConfigured() || !question) return
  try {
    const settings = await getSettings()
    await Promise.all([bump('chats', settings.tz), logQuestion(question, settings.tz)])
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
    const sent = await sendMessage(text, {
      thread: settings.topics?.chats, silent: !hiring || isHushed(settings),
      buttons: sid ? [[{ text: '🎙 Take over this chat', callback_data: `live:${sid}` }]] : undefined,
    })
    if (sid && sent.ok && sent.result) await linkChat(sent.result.message_id, sid)
  } catch { /* alerts never break the chat */ }
}

/** During a takeover: pass the visitor's message to Joseph (reply to it to answer). */
export async function forwardLive(req: NextRequest, sid: string, message: string) {
  if (!tgConfigured() || !message) return
  const settings = await getSettings()
  const sent = await sendMessage(`👤 <b>Visitor (live chat):</b>\n${esc(message.slice(0, 1500))}\n\n<i>Reply to this message to answer.</i>`, {
    thread: settings.topics?.chats, silent: false,
    buttons: [[{ text: '🤖 Hand back to PWEZA', callback_data: `liveoff:${sid}` }]],
  })
  if (sent.ok && sent.result) await linkChat(sent.result.message_id, sid)
  await touch(sid)
}

/** Visitor asked to talk to Joseph: buzz his phone with a one-tap takeover (once per chat per 10 min). */
export async function requestJoseph(req: NextRequest, sid: string, message: string): Promise<'pinged' | 'recent' | 'unavailable'> {
  if (!tgConfigured() || !hasDb()) return 'unavailable'
  if (!(await once(`ping:${sid}`, 600))) return 'recent'
  const settings = await getSettings()
  const city = req.headers.get('x-vercel-ip-city')
  const country = req.headers.get('x-vercel-ip-country') || ''
  let place = ''
  try { place = [city && decodeURIComponent(city), country].filter(Boolean).join(', ') } catch { place = country }
  const sent = await sendMessage(
    `🙋 <b>A visitor wants to talk to you</b>\n❓ ${esc(message.slice(0, 500))}${place ? `\n📍 ${esc(place)} ${flag(country)}` : ''}\n\n<i>Tap below to join their PWEZA chat — they're waiting in the chat window.</i>`,
    { thread: settings.topics?.chats || settings.topics?.priority, silent: isHushed(settings), buttons: [[{ text: '🎙 Join the chat now', callback_data: `live:${sid}` }]] },
  )
  if (sent.ok && sent.result) await linkChat(sent.result.message_id, sid)
  return sent.ok ? 'pinged' : 'unavailable'
}

/** PWEZA's router spotted a recruiter / hiring conversation: buzz Joseph once per chat (6h). */
export async function hiringSignal(req: NextRequest, sid: string, message: string, expert: string) {
  if (!tgConfigured() || !hasDb()) return
  if (!(await once(`hiring:${sid}`, 6 * 3600))) return
  const settings = await getSettings()
  const country = req.headers.get('x-vercel-ip-country') || ''
  let city = req.headers.get('x-vercel-ip-city') || ''
  try { city = decodeURIComponent(city) } catch {}
  await bump('priority', settings.tz)
  const sent = await sendMessage(
    `🔥 <b>Active hiring conversation in PWEZA</b>\n❓ ${esc(message.slice(0, 400))}\n🧭 Topic: ${esc(expert)}${city || country ? ` · 📍 ${esc([city, country].filter(Boolean).join(', '))} ${flag(country)}` : ''}\n\n<i>PWEZA is answering. Jump in any time.</i>`,
    { thread: settings.topics?.priority, silent: isHushed(settings), buttons: [[{ text: '🎙 Join the chat', callback_data: `live:${sid}` }]] },
  )
  if (sent.ok && sent.result) await linkChat(sent.result.message_id, sid)
}
