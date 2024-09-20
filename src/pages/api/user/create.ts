import { SHA256 as sha256 } from "crypto-js";
import prisma from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

// Hash password function
const hashPassword = (string: string): string => {
  return sha256(string).toString();
};

// Cloudflare Turnstile verification function
async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.NEXT_PUBLIC_CLOUDFLARE_SECRET_KEY;
  const verificationUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const formData = new URLSearchParams();
  formData.append("secret", secretKey as string);
  formData.append("response", token);

  const response = await fetch(verificationUrl, {
    method: "POST",
    body: formData,
  });
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
  const { name, email, password, turnstileToken } = req.body;

  // Validate required fields
  if (!name || !email || !password || !turnstileToken) {
    console.error(name, email, password, turnstileToken);
    return res.status(400).json({ status: 400, errors: ["Missing required fields"] });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ errors: ["Password must be at least 6 characters long"] });
  }

  // Verify Cloudflare Turnstile
  const isTurnstileValid = await verifyTurnstile(turnstileToken);
  if (!isTurnstileValid) {
    console.error("Invalid Turnstile verification");
    return res.status(400).json({ errors: ["Invalid Turnstile verification"] });
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
      return res.status(400).json({ message: "Failed to register user" });
    }

    // Handle other Prisma errors
    return res.status(500).json({ message: "Server error", error: (e as Error).message });
  }
}