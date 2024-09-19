import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, name } = req.body;

    if (!userId || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    console.log('Updating profile:', userId, name);

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name: name },
            select: { name: true },
        });
        console.log('Updated user:', updatedUser);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
}