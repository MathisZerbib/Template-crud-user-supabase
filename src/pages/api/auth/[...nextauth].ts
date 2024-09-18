import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import prisma from "../../../../lib/prisma";
import { JWT } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import { CustomPrismaAdapter } from "../../../custom-prisma-adapter";
import { SHA256 } from 'crypto-js';

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
                if (!credentials) {
                    console.log("No credentials provided");
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        password: true,
                        emailVerified: true,
                    },
                });

                console.log("User found:", user ? "Yes" : "No");

                if (user) {
                    if (credentials.password) {
                        // Normal login with password
                        const inputHash = SHA256(credentials.password).toString();
                        if (user.password === inputHash) {
                            console.log("Password match");
                            return { id: user.id, email: user.email, name: user.name };
                        } else {
                            console.log("Password mismatch");
                        }
                    } else {
                        // Auto-login after email verification
                        if (user.emailVerified) {
                            console.log("Auto-login after email verification");
                            return { id: user.id, email: user.email, name: user.name };
                        } else {
                            console.log("Email not verified for auto-login");
                        }
                    }
                }

                console.log("Authorization failed");
                return null;
            },
        }),
        EmailProvider({
            server: process.env.SENDGRID_SMTP_SERVER,
            from: process.env.SENDGRID_FROM_EMAIL,
            async sendVerificationRequest({ identifier: email, url, provider }) {
                // await sendVerificationEmail(email);
                console.log("Email sent to:", email);
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
            console.log("Sign-in attempt:", { user, account, email, credentials });
            if (email?.verificationRequest) {
                console.log("Verification request, allowing sign-in");
                return true;
            }
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email as string },
                select: { emailVerified: true },
            });
            console.log("DB User email verified:", dbUser?.emailVerified);
            return !!dbUser?.emailVerified;
        },
    },
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);
export default authHandler;