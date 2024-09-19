import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../lib/prisma";
import { SHA256 as sha256 } from "crypto-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedCurrentPassword = sha256(currentPassword).toString();
        if (user.password !== hashedCurrentPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedNewPassword = sha256(newPassword).toString();
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
}