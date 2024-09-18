import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { SHA256 } from 'crypto-js';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return res.status(400).json({ message: "Token, email, and new password are required." });
        }

        try {
            // Find the user by email and check the reset token and expiration
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user || user.resetToken !== token || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
                return res.status(400).json({ message: "Invalid or expired token." });
            }

            // Hash the new password using SHA-256
            const hashedPassword = SHA256(newPassword).toString();

            // Update the user's password and remove the reset token and expiry
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null,
                },
            });

            await prisma.session.deleteMany({
                where: { userId: user.id },
            });

            await prisma.user.update({
                where: { email },
                data: {
                    emailVerified: new Date(),
                },
            });

            return res.status(200).json({ message: "Password has been reset successfully." });
        } catch (error) {
            console.error("Error resetting password:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    } else {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
}