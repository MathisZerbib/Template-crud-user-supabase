import { Inter } from "next/font/google";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

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

  // Use the server-side session if available, otherwise fall back to client-side session
  const session = serverSession || clientSession;

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <h1>Session: {session?.user?.name ?? "No session"}</h1>
      {session?.user?.email && <p>Email: {session.user.email}</p>}
      {session?.user?.image && (
        <img src={session.user.image} alt="User" width={100} height={100} />
      )}
      <Link href="/api/auth/signout" onClick={() => signOut()}>
        Sign out
      </Link>
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
