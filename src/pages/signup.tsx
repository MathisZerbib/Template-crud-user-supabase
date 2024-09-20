import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../components/layout/AuthLayout";
import { Turnstile } from "@marsidev/react-turnstile";
import { signIn } from "next-auth/react";
import GoogleLogo from "../components/icons/google-logo";

function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    validatePassword(password, confirmPassword);
  }, [password, confirmPassword]);

  function validatePassword(pass: string, confirmPass: string) {
    setPassError(pass !== confirmPass && confirmPass !== "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (passError || !name || !email || !password || !captchaToken) {
      setError("Please ensure all fields are filled out correctly.");
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log("Submitting form with:", {
      name,
      email,
      password,
      captchaToken,
    });
    const userData = { name, email, password, turnstileToken: captchaToken };

    try {
      const res = await fetch("/api/user/create", {
        method: "POST",
        body: JSON.stringify(userData),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok && res.status === 201) {
        const data = await res.json();
        console.log("Registration successful", data);

        const emailRes = await fetch("/api/send-verification-email", {
          method: "POST",
          body: JSON.stringify({
            email,
            verificationToken: data.verificationToken,
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (emailRes.ok) {
          setIsEmailSent(true);
        } else {
          setError("Failed to send verification email. Please try again.");
        }
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      if (window.turnstile) {
        window.turnstile.reset();
      }
    }
  }

  async function handleGoogleSignUp() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });
      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      console.error("Error during Google sign-up:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isEmailSent) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4">
          <h1 className="sm:text-4xl font-bold mb-4 text-center">
            Email Verification
          </h1>
          <p className="text-center max-w-md">
            We've sent a verification email to {email}. Please check your inbox
            and click on the verification link to complete your registration.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex justify-center items-center min-h-screen p-4 w-full">
        <div className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-gray-700">Sign Up</h1>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="password"
                placeholder="***********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                type="password"
                placeholder="***********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passError && (
                <p className="text-red-500 text-xs italic">
                  Passwords do not match!
                </p>
              )}
            </div>

            <Turnstile
              className="mb-4"
              options={{ size: "flexible", theme: "light" }}
              siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY!}
              onSuccess={(token) => {
                console.log("Captcha token:", token);
                setCaptchaToken(token);
              }}
            />

            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            type="button"
            className="bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 w-full mb-4 flex items-center justify-center"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <GoogleLogo className={"w-5 h-5 mr-5"} />
            <span>Sign up with Google</span>
          </button>

          <div className="text-center">
            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="/login"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default SignUp;
