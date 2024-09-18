import React, { useState, useCallback } from "react";
import { validateEmail } from "../../lib/utils";
import AuthLayout from "../components/layout/AuthLayout";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailInputError, setEmailInputError] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = useCallback(() => {
    const isEmailValid = validateEmail(email);
    setEmailInputError(!isEmailValid);
    return isEmailValid;
  }, [email]);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!validate()) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setSuccess(
          "If an account with that email exists, a password reset link has been sent."
        );
      } else {
        const data = await res.json();
        setError(
          data.message ||
            "Failed to send password reset link. Please try again."
        );
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
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
          {success && (
            <div className="mb-4 p-3 rounded-md bg-green-100 border border-green-400 text-green-700">
              {success}
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
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
