import { SHA256 as sha256 } from "crypto-js";
import prisma from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

// Hash password function
const hashPassword = (string: string): string => {
  return sha256(string).toString();
};

// hCaptcha verification function
async function verifyHCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.NEXT_PUBLIC_HCAPTCHA_SECRET_KEY;
  const verificationUrl = `https://hcaptcha.com/siteverify?secret=${secretKey}&response=${token}`;

  const response = await fetch(verificationUrl, { method: "POST" });
  const data = await response.json();

  return data.success || false;
}

// Main handler
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not allowed" });
  }

  await createUserHandler(req, res);
}

async function createUserHandler(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, password, captchaToken } = req.body;

  // Validate required fields
  if (!name || !email || !password || !captchaToken) {
    return res.status(400).json({ status: 400, errors: ["Missing required fields"] });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ errors: ["Password must be at least 6 characters long"] });
  }

  // Verify hCaptcha
  const isCaptchaValid = await verifyHCaptcha(captchaToken);
  if (!isCaptchaValid) {
    return res.status(400).json({ errors: ["Invalid hCaptcha verification"] });
  }

  try {
    // Create user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
      },
    });

    return res.status(201).json({ user });
  } catch (e) {
    // Handle unique constraint violation (P2002)
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Handle other Prisma errors
    return res.status(500).json({ message: "Server error", error: (e as Error).message });
  }
}
