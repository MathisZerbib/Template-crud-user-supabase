import { SHA256 as sha256 } from "crypto-js";
import prisma from "../../../../lib/prisma";

export default async function handle(req: { method: string; body: { email: any; password: any; }; }, res: { status: (arg0: number) => any; }) {
  if (req.method === "POST") {
    await loginUserHandler(req, res);
  } else {
    return res.status(405);
  }
}

const hashPassword = (string: string): string => {
  return sha256(string).toString();
};

async function loginUserHandler(req: { body: { email: any; password: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; } | UserWithoutPassword): any; new(): any; }; }; }) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "invalid inputs" });
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
        googleId: true,
      },
    });
    const hashedPassword = hashPassword(password);
    if (user && user.password === hashedPassword) {
      return res.status(200).json(exclude(user, ["password"]));
    } else {
      return res.status(401).json({ message: "invalid credentials" });
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error(String(e));
    }
  }
}

// Define a type for the user without password
type UserWithoutPassword = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

// Function to exclude user password returned from prisma
function exclude(user: { [x: string]: any; }, keys: string[]): UserWithoutPassword {
  const result: Partial<UserWithoutPassword> = {};
  for (const key in user) {
    if (!keys.includes(key)) {
      result[key as keyof UserWithoutPassword] = user[key];
    }
  }
  return result as UserWithoutPassword;
}