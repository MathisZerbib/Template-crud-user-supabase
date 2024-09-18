import prisma from "../../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await loginUserHandler(req, res);
  } else {
    return res.status(405).end();
  }
}

async function loginUserHandler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "invalid input" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        resetToken: true,
        resetTokenExpiry: true,
        verificationToken: true,
        emailVerified: true,
      },
    });


  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}