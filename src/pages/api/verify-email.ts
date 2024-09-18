// pages/api/verify-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { token, email } = req.body;

    if (!token || !email) {
        return res.status(400).json({ message: 'Invalid request. Token and email are required.' });
    }

    try {
        // Verify the JWT token
        const secret = process.env.NEXT_AUTH_SECRET;
        if (!secret) {
            return res.status(500).json({ message: 'Internal server error: missing authentication secret.' });
        }

        const decodedToken = jwt.verify(token, secret);

        if ((decodedToken as jwt.JwtPayload).email !== email) {
            return res.status(400).json({ message: 'Invalid token or email.' });
        }


        // Update the user in the database
        const user = await prisma.user.update({
            where: { email },
            data: {
                emailVerified: new Date(),
                verificationToken: token,
            },
        });


        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({ message: 'Internal server error during verification.' });
    }
}
