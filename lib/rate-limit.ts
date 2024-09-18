// lib/rate-limit.ts
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit'
import { NextApiRequest, NextApiResponse } from 'next'

export const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>

export default function withRateLimit(handler: NextApiHandler): NextApiHandler {
    return async function (req: NextApiRequest, res: NextApiResponse) {
        return new Promise((resolve, reject) => {
            limiter(req, res, (result: any) => {
                if (result instanceof Error) {
                    return reject(result)
                }
                return resolve(handler(req, res))
            })
        })
    }
}