import { SignUpButton, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { LoadingPage, LoadingSpinnerLOAD} from "~/components/loading";
import toast, { Toaster } from "react-hot-toast";
import { FullPageLayout } from "~/components/outerpage";
import { PageLayout } from "~/components/layout";
import { Search, SquarePen, Bell } from "lucide-react";
import Sidebar, { UserDropdown } from "~/components/sidebar";
import TopicSlider from "~/components/navigationBar";
import PostView from "~/components/postview";
import { useRouter } from "next/router";

dayjs.extend(relativeTime)

// use helper from api to select the types used from post.getAll -> create new type
type PostWithUser = RouterOutputs["post"]["getAll"][number];

const Feed = () => {
  // tRPC React hook fetches data from your getAll endpoint under postRouter.
  // retrieve data from the query and rename isLoading -> use multiple time
  const { data, isLoading: postLoading } = api.post.getAll.useQuery();

  if (postLoading) return <LoadingPage/>

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

export const useSyncUserOnSignIn = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    fetch("/api/user/sync", { method: "POST" })
      .then(res => {
        if (!res.ok) throw new Error("Sync failed");
      })
      .catch(console.error);
  }, [isLoaded, isSignedIn]);
};


export default function Home() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useSyncUserOnSignIn();
  
  // Start fetch data from the database ASAP
  api.post.getAll.useQuery();
  // return empty div if both aren't loaded since user loaded faster
  if (!userLoaded) return <LoadingPage />;

  return (
    // flex item allow to shrink grow
    // only have max as 2xl if the size is medium || large
    <>
      {!isSignedIn ? (
        <FullPageLayout>
          <header className="min-w-screen flex justify-between items-center p-4 px-50 border-b border-black text-sm">
            <div className="flex items-center gap-120 w-full">

              {/* Left side: logo */}
              <Link href="/">
                <div className="px-35 text-3xl font-bold font-serif">Medium</div>
              </Link>

              {/* Center/right side: nav links */}
              <nav className="flex items-center gap-6">
                <a href="#" className="hover:underline">Our Story</a>
                <a href="#" className="hover:underline">Membership</a>
                <a href="#" className="hover:underline">Write</a>
                <SignInButton mode="modal">
                  <button className="hover:underline">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="ml-4 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
                    Get started
                  </button>
                </SignUpButton>
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
              <SignUpButton mode="modal">
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
                width={370}
                height={370}
                className="w-full h-auto"
              />
            </div>
          </div>
          <footer className="min-w-screen flex justify-center gap-2 items-center mt-37 pt-6 border-t border-black text-sm text-gray-600">
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
      </FullPageLayout>
      ) : (
        // VIEW AFTER SIGN IN/ SIGN UP = HOME PAGE
        <PageLayout>
          {/* Header */}
          <header className="flex justify-between items-center px-8 py-3 border-b border-slate-300 text-sm bg-white">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold font-serif">Medium</div>
              {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-gray-100 rounded-full px-4 py-1 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
  
            <nav className="flex gap-6 items-center">
              {/* Write Post */}
              <button
                onClick={() => router.push("/write")}
                className="group flex items-center gap-1 text-gray-500 hover:text-black transition-colors"
              >
                <SquarePen className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-black transition-colors">Write</span>
              </button>

              {/* Notification Bell */}
              <button className="text-gray-500 hover:text-black transition-colors p-2 rounded-full">
                <Bell className="w-5 h-5" />
              </button>

              <div className="relative">
                <Image
                  src={user.imageUrl}
                  alt="Profile image"
                  className="w-8 h-8 rounded-full cursor-pointer"
                  width={46}
                  height={46}
                  onClick={() => setDropdownOpen((prev) => !prev)} 
                />
                {dropdownOpen && <UserDropdown username={user.username!} />}
              </div>
            </nav>
          </header>

          {/* Main Grid Layout */}
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 py-6 max-w-7xl mx-auto">
            {/* Main Feed Section */}
            <section className="lg:col-span-8 space-y-6">

              {/* Topic slider */}
              <TopicSlider/>
              <Feed />
            </section>

            {/* Sidebar */}
            <section className="lg:col-span-4 border-l border-gray-200 min-h-screen">
              <Sidebar />
            </section>
          </main>
        </PageLayout>
      )};
    </>
  );
};
