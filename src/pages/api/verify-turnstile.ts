// pages/api/verify-turnstile.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { token } = req.body;

    const secretKey = process.env.CLOUDFLARE_SECRET_KEY;

    const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret: secretKey,
                response: token,
            }),
        }
    );

    const data = await response.json();

    if (data.success) {
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, error: data['error-codes'] });
    }
}