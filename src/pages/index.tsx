import { Inter } from "next/font/google";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useState, useEffect } from "react";
import LoadingScreen from "../components/loading-screen";

const inter = Inter({ subsets: ["latin"] });

interface HomeProps {
  session: {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } | null;
  } | null;
}

export default function Home({ session: serverSession }: HomeProps) {
  const { data: clientSession, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  // Use the server-side session if available, otherwise fall back to client-side session
  const session = serverSession || clientSession;

  useEffect(() => {
    if (status !== "loading") {
      setTimeout(() => setIsLoading(false), 1000); // Add a slight delay for smoother transition
    }
  }, [status]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome, {session?.user?.name ?? "Guest"}
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="User"
              width={100}
              height={100}
              className="rounded-full"
            />
          ) : (
            <span className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
              ?
            </span>
          )}
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <h1 className="relative z-10 text-4xl font-bold">
          {session?.user?.email ?? "No email available"}
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <Link
          href="/api/auth/signout"
          onClick={(e) => {
            e.preventDefault();
            signOut();
          }}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Sign Out{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Click here to sign out of your account.
          </p>
        </Link>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // Ensure all properties in the session object are serializable
  const safeSession = {
    user: session.user
      ? {
          ...session.user,
          name: session.user.name || null,
          email: session.user.email || null,
          image: session.user.image || null,
        }
      : null,
  };

  return {
    props: {
      session: safeSession,
    },
  };
};
