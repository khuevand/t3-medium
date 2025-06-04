import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import PostView from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.post.getById.useQuery({
    id,
  });

  if (!data)
    return <div>404</div>;

  return (
    // flex item allow to shrink grow
    // only have max as 2xl if the size is medium || large
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data}/>
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {

  const helper = generateSSGHelper();
  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no post id");

  await helper.post.getById.prefetch({ id });
  return {
    props: {
      trpcState: helper.dehydrate(),
      id,
    },
  };
};

// No paths are statically generated at build time. Page generated the first time it's accessed.
export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"};
}
export default SinglePostPage;