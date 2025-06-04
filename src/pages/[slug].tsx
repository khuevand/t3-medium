import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUserName.useQuery({
    username,
  });

  if (!data)
    return <div>404</div>;

  return (
    // flex item allow to shrink grow
    // only have max as 2xl if the size is medium || large
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="h-36 border-b bg-slate-600 relative">
          <Image
            src={data.profilePicture}
            alt={`${data.username ?? ""}'s profile picture`}
            width={128}
            height={128}
            className="-mb-8 absolute bottom-0 left-0 -mb-[64px] rounded-full border-4 border-black ml-4 bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.username ?? ""}`}
            {data.username}
        </div>
        <div className="border-b border-slate-400 w-full"/>
      </PageLayout>
    </>
  );
}

import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";
import { currentUser } from "@clerk/nextjs/server";
import { PageLayout } from "~/components/layout";

export const getStaticProps: GetStaticProps = async (context) => {
  const helper = createServerSideHelpers({
    router: appRouter,
    ctx: {db, currentUser: null},
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helper.profile.getUserByUserName.prefetch({ username });
  return {
    props: {
      trpcState: helper.dehydrate(),
      username,
    },
  };
};

// No paths are statically generated at build time. Page generated the first time it's accessed.
export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"};
}
export default ProfilePage;