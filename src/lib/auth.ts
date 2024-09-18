import prisma from "../../lib/prisma";

export async function verifyEmail(token: string, email: string) {
    const user = await prisma.user.findFirst({
        where: {
            email: email,
            verificationToken: token,
        },
    });

    if (!user) {
        throw new Error('Invalid verification token or email');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: new Date(),
            verificationToken: null,
        },
    });

    return true;
}