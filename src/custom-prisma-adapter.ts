import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
export function CustomPrismaAdapter(prisma: PrismaClient) {
    return {
        ...PrismaAdapter(prisma),
        createVerificationToken: async (data: { identifier: string; token: string; expires: Date }) => {
            console.log("Creating verification token for:", data.identifier);
            const verificationRequest = await prisma.verificationRequest.create({
                data: {
                    identifier: data.identifier,
                    token: data.token,
                    expires: data.expires,
                },
            })
            return {
                ...verificationRequest
            }
        },
        useVerificationToken: async (params: { identifier: string; token: string }) => {
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
                return {
                    ...verificationRequest
                }
            }
            return null
        },
        getUserByEmail: async (email: string) => {
            console.log("Getting user by email:", email);
            const user = await prisma.user.findUnique({
                where: { email },
            })
            console.log("User found:", user ? "Yes" : "No");
            return user
        },
    }
}