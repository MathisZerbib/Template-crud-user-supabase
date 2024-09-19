import React from "react";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import AuthLayout from "../components/layout/AuthLayout";

const inter = Inter({ subsets: ["latin"] });

export default function Profile({ session: serverSession }) {
  const { data: clientSession } = useSession();
  const session = serverSession || clientSession;

  if (!session) {
    return (
      <AuthLayout>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You need to be signed in to view this page.</p>

          <Link
            href="/login"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
      >
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            Profile of {session.user?.name ?? "Guest"}
          </p>
        </div>

        <div className="relative flex flex-col items-center place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
          <h1 className="relative z-10 text-4xl font-bold mb-4">
            {session.user?.name ?? "Anonymous User"}
          </h1>
          <p className="relative z-10 text-xl">
            {session.user?.email ?? "No email available"}
          </p>
        </div>

        <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
          <Link
            href="/"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Go back{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Click here to go back to the home page.
            </p>
          </Link>
        </div>
      </main>
    </AuthLayout>
  );
}
