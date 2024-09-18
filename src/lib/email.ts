import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendPasswordResetEmail(email: string, resetLink: string) {
    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL!, // Use your verified SendGrid sender email
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
        html: `<p>You requested a password reset. Click the link to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Password reset email sent');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Error sending password reset email');
    }
}


export async function sendVerificationEmail(email: string) {
    const token = jwt.sign({ email }, process.env.NEXT_AUTH_SECRET!, {
        expiresIn: '1h', // Token expires in 1 hour
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL!, // Your SendGrid verified email
        subject: 'Verify your email address',
        text: `Please verify your email by clicking the link: ${verificationUrl}`,
        html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error in lib sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
}
