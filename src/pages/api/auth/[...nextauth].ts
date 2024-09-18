import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import prisma from "../../../../lib/prisma";
import { JWT } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import { sendVerificationEmail } from "../../../lib/email";
import { CustomPrismaAdapter } from "../../../custom-prisma-adapter";
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "example@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
                    return { id: user.id, email: user.email, name: user.name };
                }

                return null;
            },

        }),

        EmailProvider({
            server: process.env.SENDGRID_SMTP_SERVER,
            from: process.env.SENDGRID_FROM_EMAIL,
            async sendVerificationRequest({ identifier: email, url, provider }) {
                await sendVerificationEmail(email);
            },
        }),
    ],

    adapter: CustomPrismaAdapter(prisma),
    secret: process.env.NEXT_AUTH_SECRET,

    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    },

    jwt: {
        secret: process.env.NEXT_AUTH_SECRET,
        maxAge: 60 * 60 * 24 * 30,
    },

    pages: {
        signIn: "/login",
        signOut: "/login",
        error: "/login",
        verifyRequest: '/verify-email',
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

        async signIn({ user, account, profile, email, credentials }) {
            if (email?.verificationRequest) {
                return true; // Allow sign in if it's a verification request
            }
            const isVerified = await prisma.user.findUnique({
                where: { email: user.email as string },
                select: { emailVerified: true },
            });
            return !!isVerified?.emailVerified; // Only allow sign in if email is verified
        },
    },
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);
export default authHandler;