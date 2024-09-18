import { Inter } from "next/font/google";
import { authOptions } from "./api/auth/[...nextauth]";

import { getServerSession } from "next-auth";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  // Use destructuring with proper typing
  const { data: session, status } = useSession();

  // Loading or unauthenticated state handling
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <h1>Session: {session?.user?.name ?? "No session"}</h1>
      <Link href="/api/auth/signout" onClick={() => signOut()}>
        Sign out
      </Link>
    </main>
  );
}

// Typing for getServerSideProps using GetServerSideProps
export const getServerSideProps: GetServerSideProps = async (
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

  return {
    props: {
      session,
    },
  };
};
