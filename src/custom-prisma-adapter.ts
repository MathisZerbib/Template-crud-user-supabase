import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { Adapter, AdapterUser, VerificationToken } from "next-auth/adapters"

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
    return {
        ...PrismaAdapter(prisma),
        createVerificationToken: async (data: { identifier: string; token: string; expires: Date }): Promise<VerificationToken> => {
            console.log("Creating verification token for:", data.identifier);
            const verificationRequest = await prisma.verificationRequest.create({
                data: {
                    identifier: data.identifier,
                    token: data.token,
                    expires: data.expires,
                },
            })
            return verificationRequest
        },
        useVerificationToken: async (params: { identifier: string; token: string }): Promise<VerificationToken | null> => {
            console.log("Using verification token for:", params.identifier);
            const verificationRequest = await prisma.verificationRequest.findUnique({
                where: {
                    identifier_token: {
                        identifier: params.identifier,
                        token: params.token,
                    },
                },
            })
            if (verificationRequest) {
                await prisma.verificationRequest.delete({
                    where: {
                        id: verificationRequest.id,
                    },
                })
                return verificationRequest
            }
            return null
        },
        getUserByEmail: async (email: string): Promise<AdapterUser | null> => {
            console.log("Getting user by email:", email);
            if (!email) {
                console.log("No email provided");
                return null
            }
            const user = await prisma.user.findUnique({
                where: { email },
            })
            console.log("User found:", user ? "Yes" : "No");
            return user as AdapterUser | null
        },
    }
}