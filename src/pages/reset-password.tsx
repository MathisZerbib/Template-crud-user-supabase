import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ResetPassword() {
  const router = useRouter();
  const { token, email } = router.query;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset error on password input change
  useEffect(() => {
    setError("");
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, email, newPassword }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (res.ok) {
      setSuccess("Password reset successfully!");
    } else {
      setError(data.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Reset Password
        </h1>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 text-lg font-medium">{success}</p>
            <Link href="/login">
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Go to Login
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="new-password" className="block text-gray-700">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
