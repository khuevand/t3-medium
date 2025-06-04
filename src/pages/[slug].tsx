import type { GetStaticProps, NextPage } from "next";
import type { FC } from "react";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import PostView from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PageLayout } from "~/components/layout";

type ProfileFeedProps = {
  userId: string;
};


const ProfileFeed: FC<ProfileFeedProps> = ({ userId }) => {
  const { data, isLoading } = api.post.getPostedByUserId.useQuery({userId});

  if (isLoading) return <LoadingPage/>;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return <div className="flex flex-col">
    {data.map((fullPost) => (
      <PostView {...fullPost} key={fullPost.post.id} />
    ))}
  </div>
};

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
        </div>
        <div className="border-b border-slate-400 w-full"/>
        <ProfileFeed userId={data.id}/>
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  
  const helper = generateSSGHelper();
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