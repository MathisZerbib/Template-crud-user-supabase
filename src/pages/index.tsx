import { Inter } from "next/font/google";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import LoadingScreen from "../components/loading-screen";
import UserProfileMenu from "../components/user-profile-menu";
import Link from "next/link";
import { Session } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

interface ProfileProps {
  session: Session | null;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (session?.user?.id) {
          const response = await fetch(
            `/api/get-user?userId=${session.user.id}`
          ); // Fetch user info from the API
          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          } else {
            throw new Error("Failed to fetch user info");
          }
        } else {
          throw new Error("No user ID available");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 1000); // Add a slight delay for smoother transition
      }
    };

    fetchUserInfo();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleSignOut = () => {
    signOut();
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome, {userInfo?.name ?? "Guest"}
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          {userInfo && (
            <UserProfileMenu user={userInfo} onSignOut={handleSignOut} />
          )}
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <h1 className="relative z-10 text-4xl font-bold">
          {userInfo?.email ?? "No email available"}
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
