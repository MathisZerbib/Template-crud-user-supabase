import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../../lib/prisma";
import { JWT } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";

// Define user account globally (or consider moving inside the function if local)
let userAccount: any;

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "example@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Invalid credentials");
                }

                const userCredentials = {
                    email: credentials.email,
                    password: credentials.password,
                };

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/user/login`,
                    {
                        method: "POST",
                        body: JSON.stringify(userCredentials),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                const user = await res.json();

                if (res.ok && user) {
                    userAccount = user;
                    return user;  // This should return a user object or null
                } else {
                    return null;
                }
            },
        }),
    ],

    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,  // 24 hours
    },

    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 60 * 60 * 24 * 30,  // 30 days
    },

    pages: {
        signIn: "/login",
        signOut: "/login",
        error: "/login",
    },

    callbacks: {
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.sub,
                    accessToken: token.accessToken,
                } as User & { id: string; accessToken: string };
            }
            return session;
        },

        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.accessToken = `${user.id}-${user.email}-${user.name}`;
            }
            return token;
        },
    },
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);
export default authHandler;