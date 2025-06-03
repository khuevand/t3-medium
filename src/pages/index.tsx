import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
// import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { use } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { LoadingPage} from "~/components/loading";

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const {user} = useUser();

  console.log(user);

  if (!user) return null;

  return (
    <div className="flex gap-3 w-full">
      <Image 
        src={user.imageUrl}
        alt="Profile image"
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <input placeholder="Type some emojis!" className="grow bg-transparent outline-none"/>
    </div>
    );
}

// use helper from api to select the types used from post.getAll -> create new type
type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="border-b border-slate-400 p-4 flex gap-3">
      <Image src={author.profilePicture} className="h-14 w-14 rounded-full"
      alt={`@${author.username}'s profile picture`}
      width={56}
      height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300 font-bold gap-1">
          <span>{`@${author.username} `}</span>
          <span className="font-thin">{` . ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
          <span>{post.content}</span>
      </div>
    </div>
  )
}


const Feed = () => {
  // tRPC React hook fetches data from your getAll endpoint under postRouter.
  // retrieve data from the query and rename isLoading -> use multiple time
  const { data, isLoading: postLoading } = api.post.getAll.useQuery();

  if (postLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong...</div>
  return(
    <div className="flex flex-col">
      {/* return 1 post view for everypost following the key*/}          
      {[...data, ...data]?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )
}
export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  // Start fetch data from the database ASAP
  api.post.getAll.useQuery();
  // return empty div if both aren't loaded since user loaded faster
  if (!userLoaded) return <div/>

  return (
    // flex item allow to shrink grow
    // only have max as 2xl if the size is medium || large
    <main className="flex h-screen justify-center">
      <div className="h-full w-full md:max-w-2xl bg-black border-x border-slate-400">
        <div className="border-b border-slate-400 p-4 flex">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton /> 
          </div>
          )}
          {isSignedIn && <CreatePostWizard/> }
        </div>
        <Feed />
        </div>
    </main>
  );
}
