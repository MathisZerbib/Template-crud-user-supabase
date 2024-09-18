import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { pageProps: { session: any } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
