import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import prisma from "../../../../lib/prisma";
import { JWT } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import { CustomPrismaAdapter } from "../../../custom-prisma-adapter";
import { SHA256 } from 'crypto-js';
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    googleId: profile.sub,
                }
            },
        }),

        /// Prop googleid in user 
        // if register normal == google id null 
        // else and already registered set google id
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
                        googleId: true,
                    },
                });


                if (user) {
                    if (user.googleId && credentials.password) {
                        // log user in with google
                        const inputHash = SHA256(credentials
                            .password).toString();
                        if (user.password === inputHash) {
                            console.log("Password match");
                            return { id: user.id, email: user.email, name: user.name };
                        }
                        else {
                            console.log("Password mismatch");
                            return null;
                        }

                    }
                    if (user.googleId) {
                        console.log("User has a linked Google account");
                        return null; // Prevent login with credentials for Google-linked accounts
                    }

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
        error: '/auth/error',
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

            if (account?.provider === "google") {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email as string },
                    select: { id: true, emailVerified: true, googleId: true }
                });

                if (existingUser) {
                    if (existingUser.emailVerified && !existingUser.googleId) {
                        // User exists, email is verified, and Google account is not linked yet
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: { googleId: user.id },
                        });
                        console.log("Linked Google account to existing user");
                        return true;
                    } else if (existingUser.googleId) {
                        // Google account already linked, allow sign in
                        console.log("Google account already linked, allowing sign in");
                        return true;
                    } else {
                        // User exists but email is not verified, don't link account
                        console.log("User exists but email is not verified, not linking account");
                        return false;
                    }
                } else {
                    // User doesn't exist, create new account
                    await prisma.user.create({
                        data: {
                            name: user.name,
                            email: user.email,
                            googleId: user.id,
                            emailVerified: new Date(), // Google accounts are considered verified
                        },
                    });
                    console.log("Created new user with Google account");
                    return true;
                }
            }

            if (email?.verificationRequest) {
                console.log("Verification request, allowing sign-in");
                return true;
            }

            // For non-Google sign-ins, check if email is verified
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email as string },
                select: { emailVerified: true },
            });
            console.log("DB User email verified:", dbUser?.emailVerified);

            return !!dbUser?.emailVerified;
        },


        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        }
    },
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);
export default authHandler;

