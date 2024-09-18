import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

export function CustomPrismaAdapter(prisma: PrismaClient) {
    return {
        ...PrismaAdapter(prisma),
        createVerificationToken: async (data: { identifier: string; token: string; expires: Date }) => {
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
            const user = await prisma.user.findUnique({
                where: { email },
            })
            return user
        },
    }
}