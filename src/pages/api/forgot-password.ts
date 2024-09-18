import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { sendPasswordResetEmail } from "../../lib/email";
import { v4 as uuidv4 } from "uuid";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
      }

      // Generate a password reset token and expiration (e.g., 1 hour from now)
      const resetToken = uuidv4();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save the token and expiry in the user's record
      await prisma.user.update({
        where: { email },
        data: { resetToken, resetTokenExpiry },
      });

      // Send password reset email
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${email}`;
      await sendPasswordResetEmail(email, resetLink);

      return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
