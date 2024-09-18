import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${email}`;

    const msg = {
        to: email,
        from: 'mathis.zerbib@epitech.eu', // Use your verified SendGrid sender email
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        html: `<p>You requested a password reset. Click the link to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Password reset email sent');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Error sending password reset email');
    }
}


export async function sendVerificationEmail(email: string, verificationToken: string) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/verify-email?token=${verificationToken}&email=${email}`;

    const msg = {
        to: email,
        from: 'mathis.zerbib@epitech.eu', // Use your verified SendGrid sender email
        subject: 'Verify your email address',
        text: `Click the link to verify your email address: ${verificationUrl}`,
        html: `<p>Click the link to verify your email address:</p><p><a href="${verificationUrl}">Verify Email</a></p>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Error sending verification email');
    }
}
