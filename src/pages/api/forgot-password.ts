import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { sendPasswordResetEmail } from "../../lib/email";

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

      // Generate a password reset token and save it to the user record
      const resetToken = generateResetToken(); // Assume you have a function to generate tokens
      await prisma.user.update({
        where: { email },
        data: { resetToken },
      });

      // Send the password reset email
      await sendPasswordResetEmail(email, resetToken);

      return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}

function generateResetToken() {
  // Generate a random string for the reset token
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}