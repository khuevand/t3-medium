import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
// import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { use, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { LoadingPage, LoadingSpinner} from "~/components/loading";
import toast, { Toaster } from "react-hot-toast";
import { error } from "console";

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const {user} = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();

  const postMutation = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      }
      else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  console.log(user);

  if (!user) return null;

  // POST STRUCTURE //
  return (
    <div className="flex gap-3 w-full">
      <Link href={`/@${user.username}`}><Image 
        src={user.imageUrl}
        alt="Profile image"
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      /></Link>
      <input placeholder="Type some emojis!"
      className="grow bg-transparent outline-none"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter"){
          e.preventDefault();
          if (input !== ""){
           postMutation.mutate({content: input})
          }
        }
      }}
      disabled={postMutation.isPending}
      />
      {input !== "" && !postMutation.isPending && (
        <button onClick={() => postMutation.mutate({ content: input })}>Post</button>
      )}

      {postMutation.isPending && (
        <div className="flex justify-center items-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
}

// use helper from api to select the types used from post.getAll -> create new type
type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="border-b border-slate-400 p-4 flex gap-3">
      <Link href={`/@${author.username}`}><Image src={author.profilePicture} className="h-14 w-14 rounded-full"
      alt={`@${author.username}'s profile picture`}
      width={56}
      height={56}
      /></Link>
      <div className="flex flex-col">
        <div className="flex text-slate-300 font-bold gap-1">
          <Link href={`/@${author.username}`}><span>{`@${author.username} `}</span></Link>
          <Link href={`/post/${post.id}`}><span className="font-thin">{` . ${dayjs(post.createdAt).fromNow()}`}</span></Link>
        </div>
          <span className="text-2xl">{post.content}</span>
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
      {data.map((fullPost) => (
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
