// pages/api/send-verification-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sendVerificationEmail } from '../../lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      await sendVerificationEmail(email);
      res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
      console.error('Error sending verification email:', error);
      res.status(500).json({ message: 'Error sending verification email' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
