import type { NextRequest } from 'next/server'

/** The daily honesty exam calls /api/chat with this header so its trick questions
 *  don't ping Joseph, inflate the public attack counter, or land in the answer cache. */
export const EVAL_HEADER = 'x-pweza-eval'
export function isEvalRequest(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  return !!secret && req.headers.get(EVAL_HEADER) === secret
}
