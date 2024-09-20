import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useSession } from "next-auth/react";
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

const inter = Inter({ subsets: ["latin"] });

interface ProfileProps {
  session: Session | null;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export default function Profile() {
  const { data: session, update: updateSession } = useSession();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(
            `/api/get-user?userId=${session.user.id}`
          );
          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
            setNewName(data.name);
          } else {
            throw new Error("Failed to fetch user info");
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
          setMessage("Error fetching user information");
        }
      }
    };

    fetchUserInfo();
  }, [session]);

  const handleEditName = () => {
    setEditName(true);
  };

  const handleSaveName = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const updateResponse = await fetch("/api/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userInfo?.id,
          name: newName,
        }),
      });

      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        setMessage("Name updated successfully");
        setEditName(false);
        setUserInfo((prevState) => ({ ...prevState!, name: updatedUser.name }));
        await updateSession({
          ...session,
          user: { ...session?.user, name: updatedUser.name },
        });
      } else {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || "Error updating name");
      }
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) {
    return (
      <main
        className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className}`}
      >
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be signed in to view this page.</p>
        <br />
        <Link
          href="/login"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Profile of {userInfo?.name ?? "Guest"}
        </p>
      </div>

      <div className="relative flex flex-col items-center place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        {editName ? (
          <div className="relative z-10 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-2 py-1 border rounded text-gray-800"
            />
            <button
              onClick={handleSaveName}
              disabled={isSaving}
              className="ml-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <h1 className="relative z-10 sm:text-4xl font-bold mb-4">
            {userInfo?.name}
            <button
              onClick={handleEditName}
              className="ml-4 text-sm text-blue-500 hover:underline"
            >
              Edit
            </button>
          </h1>
        )}

        <p className="relative z-10 text-xl">
          {userInfo?.email ?? "No email available"}
        </p>

        {userInfo?.id && (
          <p className="relative z-10 text-sm mt-2">User ID: {userInfo.id}</p>
        )}

        {message && (
          <p
            className={`mt-4 ${
              message.includes("Error") ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <Link
          href={process.env.NEXT_PUBLIC_APP_URL ?? "/"}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 sm:text-2xl font-semibold`}>
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              &lt;-
            </span>{" "}
            Go Back
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Click here to go to Home.
          </p>
        </Link>
      </div>
    </main>
  );
}
