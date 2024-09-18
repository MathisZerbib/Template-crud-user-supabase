import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';

export async function verifyEmail(token: string, email: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };

        if (decoded.email !== email) {
            throw new Error('Invalid token');
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new Error('User not found');
        }

        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        });

        return true;
    } catch (error) {
        console.error('Email verification failed:', error);
        throw error;
    }
}