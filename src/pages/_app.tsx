import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import Head from "next/head";


const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <Head>
        <title>t3-medium</title>
      </Head>
      <Toaster position="bottom-center"/>
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
