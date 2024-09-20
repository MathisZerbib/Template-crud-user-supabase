import React, { useState, useCallback, useEffect } from "react";
import { validateEmail } from "../../lib/utils";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "../components/layout/AuthLayout";
import { Turnstile } from "@marsidev/react-turnstile";
import GoogleLogo from "../components/icons/google-logo";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailInputError, setEmailInputError] = useState(false);
  const [passwordInputError, setPasswordInputError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Check for error in URL query params
    const { error } = router.query;
    if (error) {
      setError(Array.isArray(error) ? error[0] : error);
    }
  }, [router.query]);

  const validate = useCallback(() => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.length >= 6;
    setEmailInputError(!isEmailValid);
    setPasswordInputError(!isPasswordValid);
    return isEmailValid && isPasswordValid;
  }, [email, password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !captchaToken) {
      setError("Please correct the input errors and complete the captcha.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting to sign in with:", { email, password: "******" });
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Sign-in response:", res);

      if (res?.ok) {
        console.log("Login successful, redirecting...");
        router.push("/");
      } else {
        setError("Login failed. Please check your credentials and try again.");
        console.error("Login failed:", res?.error);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!captchaToken) {
      setError("Please complete the captcha.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting to sign in with Google...");
      const result = await signIn("google", {
        callbackUrl: process.env.NEXT_PUBLIC_APP_URL,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="flex justify-center items-center min-h-screen p-4 sm:p-6 lg:p-8 w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg px-6 sm:px-8 pt-6 pb-8 mb-4 w-full max-w-md"
        >
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-400 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className={`shadow appearance-none border ${
                emailInputError ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-colors duration-200`}
              id="email"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validate}
            />
            {emailInputError && (
              <p className="text-red-500 text-xs italic mt-1">
                Please enter a valid email address.
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className={`shadow appearance-none border ${
                passwordInputError ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline transition-colors duration-200`}
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validate}
            />
            {passwordInputError && (
              <p className="text-red-500 text-xs italic mt-1">
                Password must be at least 6 characters long.
              </p>
            )}
          </div>

          {/* hCaptcha Component */}
          <Turnstile
            options={{ size: "flexible", theme: "light" }}
            siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY!}
            onSuccess={(token) => {
              setCaptchaToken(token);
            }}
            className="mb-4"
          />

          <div className="flex flex-col items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Sign In"}
            </button>
            <div className="flex items-center my-4 w-full">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-600">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <button
              type="button"
              className="bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 w-full mb-4 flex items-center justify-center"
              onClick={signInWithGoogle}
              disabled={isLoading}
            >
              <GoogleLogo className={"w-5 h-5 mr-5"} />
              <span>Sign in with Google</span>
            </button>

            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="flex items-center justify-center mt-6">
            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="/signup"
            >
              Don&apos;t have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
