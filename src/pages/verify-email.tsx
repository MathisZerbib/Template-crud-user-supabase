import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { signIn } from "next-auth/react";

interface VerifyEmailProps {
  token: string | null;
  email: string | null;
}

export default function VerifyEmail({ token, email }: VerifyEmailProps) {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");

  useEffect(() => {
    if (token && email) {
      verifyEmail(token, email)
        .then(() => {
          setVerificationStatus("success");
          // Automatically sign in the user
          signIn("credentials", {
            email,
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
            redirect: false,
          }).then((result) => {
            if (result?.ok) {
              router.push("/");
            } else {
              console.error("Auto-login failed:", result?.error);
              setVerificationStatus("error");
            }
          });
        })
        .catch((error) => {
          console.error("Verification failed:", error);
          setVerificationStatus("error");
        });
    } else {
      setVerificationStatus("error");
    }
  }, [token, email, router]);

  async function verifyEmail(token: string, email: string) {
    const response = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    });

    if (!response.ok) {
      throw new Error("Email verification failed");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Email Verification</h1>
      {verificationStatus === "verifying" && <p>Verifying your email...</p>}
      {verificationStatus === "success" && (
        <p className="text-green-600">
          Your email has been verified successfully! Logging you in...
        </p>
      )}
      {verificationStatus === "error" && (
        <p className="text-red-600">
          There was an error verifying your email. Please try again or contact
          support.
        </p>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token, email } = context.query;

  return {
    props: {
      token: token || null,
      email: email || null,
    },
  };
};
