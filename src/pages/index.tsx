  import { SignUpButton, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
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
  import { PageLayout } from "~/components/layout";
  import { FullPageLayout } from "~/components/outerpage";


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
        toast.error(errorMessage?.[0] ?? "Failed to post! Please try again later.");
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
      <Link href={`/post/${post.id}`}>
        <div key={post.id} className="border-b border-slate-400 p-4 flex gap-3">
          <Link href={`/@${author.username}`}><Image src={author.profilePicture} className="h-14 w-14 rounded-full"
          alt={`@${author.username}'s profile picture`}
          width={56}
          height={56}
          /></Link>
          <div className="flex flex-col">
            <div className="flex text-slate-300 font-bold gap-1">
              <Link href={`/@${author.username}`}><span>{`@${author.username} `}</span></Link>
              <span className="font-thin">{` . ${dayjs(post.createdAt).fromNow()}`}</span>
            </div>
              <span className="text-2xl">{post.content}</span>
          </div>
        </div>
      </Link>
    );
  };


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
      <FullPageLayout>
        {!isSignedIn ? (
          <>
            <header className="min-w-screen flex justify-between items-center pb-4.5 px-50 py-4.5 border-b border-black text-sm">
              <div className="flex items-center gap-120 w-full">
                {/* Left side: logo */}
                <div className="px-35 text-3xl font-bold font-serif">Medium</div>

                {/* Center/right side: nav links */}
                <nav className="flex items-center gap-6">
                  <a href="#" className="hover:underline">Our Story</a>
                  <a href="#" className="hover:underline">Membership</a>
                  <a href="#" className="hover:underline">Write</a>
                  <a href="#" className="hover:underline">Sign in</a>
                  <button className="ml-4 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
                    Get started
                  </button>
                </nav>
              </div>
            </header>
            <div className="flex flex-row justify-between items-start w-full">
              <div className="flex flex-col items-start text-left gap-4 pt-60 pl-80 w-full md:w-1/2">
                <h1 className="text-8xl md:text-8xl font-serif leading-none">
                    Human <br /> stories & ideas
                </h1>
                <p className="text-lg md:text-xl text-gray-800 mb-8">
                  A place to read, write, and deepen your understanding
                </p>
                <SignUpButton>
                  <button className="bg-black text-white px-10 py-2 rounded-full text-lg hover:bg-gray-800">
                    Start reading
                  </button>
                </SignUpButton>
              </div>

                        {/* Right side: image */}
              <div className="hidden md:block items-center max-w-screen pt-40">
                <Image
                  src="/medium_outer.png" // make sure this matches your actual file path
                  alt="Illustration"
                  width={350}
                  height={350}
                  className="w-full h-auto"
                />
              </div>
            </div>
            <footer className="min-w-screen flex justify-center gap-2 items-center mt-37 pt-6 pb-6 border-t border-black text-sm text-gray-600">
              {/* Center/right side: nav links */}
              <nav className="flex items-center gap-6">
                <a href="#" className="hover:underline">Help</a>
                <a href="#" className="hover:underline">Status</a>
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Careers</a>
                <a href="#" className="hover:underline">Press</a>
                <a href="#" className="hover:underline">Blog</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Rules</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Text to speech</a>
              </nav>
            </footer>
          </>
        ) : (
          // Authenticated view
          <>
            <div className="border-b border-slate-400 p-4">
              <SignOutButton />
              <CreatePostWizard />
            </div>
            <Feed />
          </>
        )}
    </FullPageLayout>
    );
  }
