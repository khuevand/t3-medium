import { useUser } from "@clerk/nextjs";
// import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { use, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { type NextPage } from "next";
import Head from "next/head";

const SinglePostPage: NextPage = () => {
  return (
    // flex item allow to shrink grow
    // only have max as 2xl if the size is medium || large
    <>
        <Head>
            <title>Post</title>
            {/* <meta name="description" content="💭" /> */}
            {/* <link rel="icon" href="/favicon.ico" /> */}
        </Head>
        <main className="flex h-screen justify-center">
            <div>
            Post View
            </div>
        </main>
    </>

    );
}

export default SinglePostPage;