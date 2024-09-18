import { SHA256 as sha256 } from "crypto-js";
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
      },
    });
    if (user && user.password === hashPassword(password)) {
      return res.status(200).json(exclude(user, ["password"]));
    } else {
      return res.status(401).json({ message: "invalid credentials" });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const hashPassword = (string: string): string => {
  return sha256(string).toString();
};

function exclude<T, Key extends keyof T>(user: T, keys: Key[]): Omit<T, Key> {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}