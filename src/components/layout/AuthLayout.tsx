import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex h-screen w-screen justify-center items-center overflow-hidden">
      {children}
    </main>
  );
}

export default AuthLayout;
