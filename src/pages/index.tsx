import { Inter } from "next/font/google";
import { signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
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
import { useState, useEffect } from "react";
import Image from "next/image";
import LoadingScreen from "../components/loading-screen";
import UserProfileMenu from "../components/user-profile-menu";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

interface UserInfo {
  id: string;
  name: string;
  email: string;
  image?: string;
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
          );
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
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    fetchUserInfo();
  }, [session]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  if (!session) {
    return (
      <main
        className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className}`}
      >
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be signed in to view this page.</p>
        <Link href="/login" className="mt-4 text-blue-500 hover:underline">
          Sign In
        </Link>
      </main>
    );
  } else {
    return (
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-12 ${inter.className}`}
      >
        <div className="z-10 w-full max-w-5xl font-mono text-sm">
          <div className="flex flex-col items-end mb-8">
            <div className="flex items-center mb-4">
              {userInfo?.image && (
                <Image
                  src={userInfo.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full mr-4"
                />
              )}
            </div>
            <div className="sm:ml-auto">
              {userInfo && (
                <UserProfileMenu user={userInfo} onSignOut={handleSignOut} />
              )}
            </div>
          </div>
        </div>

        <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
          <h1 className="relative z-10 sm:text-4xl font-bold text-center">
            {userInfo?.email ?? "No email available"}
          </h1>
        </div>

        <div className="mb-32 grid text-center sm:mb-0 sm:grid-cols-4 sm:text-left">
          <Link
            href="/api/auth/signout"
            onClick={(e) => {
              e.preventDefault();
              signOut({ callbackUrl: "/login" });
            }}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className={`mb-3 sm:text-2xl font-semibold`}>
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
}
