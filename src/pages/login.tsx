import React, { useState, useCallback } from "react";
import { validateEmail } from "../../lib/utils";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "../components/layout/AuthLayout";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailInputError, setEmailInputError] = useState(false);
  const [passwordInputError, setPasswordInputError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const validate = useCallback(() => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.length >= 6;
    setEmailInputError(!isEmailValid);
    setPasswordInputError(!isPasswordValid);
    return isEmailValid && isPasswordValid;
  }, [email, password]);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!validate()) {
      setError("Please correct the input errors before submitting.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.ok) {
        console.log("success");
        router.push("/");
      } else {
        setError("Login failed. Please check your credentials and try again.");
        console.log("Failed", res);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <AuthLayout>
        <p className="flex h-full justify-center items-center text-lg font-semibold">
          Loading...
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex justify-center items-center min-h-screen p-6 bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-md transition-transform transform hover:scale-105"
        >
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-400 text-red-700">
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
          <div className="mb-6">
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
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Sign In"}
            </button>
            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 ml-4"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="flex items-center justify-center mt-4">
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
