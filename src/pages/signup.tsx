import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthLayout from "../components/layout/AuthLayout";

function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    validatePassword(password, confirmPassword);
  }, [password, confirmPassword]);

  function validatePassword(pass: string, confirmPass: string) {
    setPassError(pass !== confirmPass && confirmPass !== "");
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (passError || !name || !email || !password) {
      return; // Don't submit if there are errors or missing fields
    }

    setIsLoading(true);

    let userData = {
      name,
      email,
      password,
    };

    try {
      const res = await fetch("/api/user/create", {
        method: "POST",
        body: JSON.stringify(userData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Registration successful", data);

        // Send a verification email via the API route
        const emailRes = await fetch("/api/send-verification-email", {
          method: "POST",
          body: JSON.stringify({
            email,
            verificationToken: data.verificationToken,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (emailRes.ok) {
          setIsEmailSent(true);
        } else {
          console.error("Failed to send verification email");
          // Handle error (e.g., show error message)
        }
      } else {
        console.error("Registration failed");
        // Handle failed registration (e.g., show error message)
      }
    } catch (error) {
      console.error("Error during registration:", error);
      // Handle network errors
    } finally {
      setIsLoading(false);
    }
  }

  if (isEmailSent) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Email Verification
          </h1>
          <p className="text-center max-w-md">
            We&apos;ve sent a verification email to {email}. Please check your
            inbox and click on the verification link to complete your
            registration.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex justify-center items-center min-h-screen p-4 w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-md"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="***********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirm-password"
            >
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="confirm-password"
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

          <div className="flex items-center justify-between flex-col sm:flex-row lg:flex-row">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 my-2 w-full sm:w-auto"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="/login"
            >
              Have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default SignUp;
