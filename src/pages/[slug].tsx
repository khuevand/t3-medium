import type { GetStaticProps, NextPage } from "next";
import type { FC } from "react";
import { useEffect } from "react";
import { useState } from "react";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import PostView from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PageLayout } from "~/components/layout";
import { Search, SquarePen, Bell } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { UserDropdown } from "~/components/sidebar";
import { useUser } from "@clerk/nextjs";

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

const SavedPostsFeed: FC = () => {
  const { data, isLoading } = api.post.getSavedPosts.useQuery();

  const uniqueUsernames = Array.from(new Set(data?.map(item => item.post.authorName))) ?? [];

  const { data: users, isLoading: usersLoading } = api.profile.getUsersByUsernames.useQuery({
    usernames: uniqueUsernames,
  });

  if (isLoading || usersLoading) return <LoadingPage />;
  if (!data || !users || data.length === 0) return <div>No saved posts</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => {
        const user = users.find(u => u.username === fullPost.post.authorName);
        if (!user) return null;

        return (
          <PostView
            key={fullPost.post.id}
            post={fullPost.post}
            author={user}
          />
        );
      })}
    </div>
  );
};



const FollowingList: FC<{ userId: string }> = ({ userId }) => {

  const [authorImages, setAuthorImages] = useState<Record<string, string>>({});

  const utils = api.useUtils();

  const { data, isLoading } = api.user.getFollowing.useQuery({ userId }, {
    enabled: !!userId,
  });

  const followStats = api.user.getFollowStats.useQuery({ userId }, {
    enabled: !!userId,
  });

  useEffect(() => {
    const fetchAvatars = async () => {
      if (!data) return;

      const usernamesToFetch = data.following
        .map((f) => f.name) // assumes you have `followeeName` in follow data
        .filter((name) => name && !authorImages[name]);

      const uniqueNames = [...new Set(usernamesToFetch)];

      for (const username of uniqueNames) {
        try {
          const user = await utils.profile.getUserByUserName.fetch({ username });
          setAuthorImages((prev) => ({ ...prev, [username]: user.profilePicture }));
        } catch (e) {
          console.error("Failed to fetch user image for", username);
        }
      }
    };

    void fetchAvatars();
  }, [data]);

  if (isLoading || followStats.isLoading) return <LoadingPage />;
  if (!data || !followStats.data || followStats.data.following === 0) {
    return <div>This user is not following anyone.</div>;
  }

  return (
    <ul className="space-y-4">
      {data.following.map((follow) => {
        const username = follow.name; // assumes you store username
        const image = authorImages[username] ?? "/default-avatar.png";

        return (
          <li key={follow.id} className="flex items-center gap-3">
            <Link href={`/@${username}`}>
            <div className="flex align-center gap-2">
                <Image
                  src={image}
                  alt={username}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>{username}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "lists" | "following">("home");
  const utils = api.useUtils();

  // Following, follower initialized
  const [isFollowing, setIsFollowing] = useState(false);
  const { user, isLoaded } = useUser();
  const { data: userData } = api.profile.getUserByUserName.useQuery({ username });



  const isOwner = user?.username === userData?.username;
  const { data: followData } = api.user.getFollowing.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user?.id } // fetches only if user is ready
  );

  useEffect(() => {
    if (followData?.following) {
      const isFollowed = followData.following.some(f => f.id === userData?.id);
      setIsFollowing(isFollowed);
    }
  }, [followData, userData?.id]);

  const toggleFollowMutation = api.user.toggleFollow.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.user.getFollowing.invalidate({ userId: user?.id ?? "" }),
        utils.user.getFollowStats.invalidate({ userId: userData?.id }),
      ]);
    },
  });

  if (!isLoaded) return <LoadingPage />;

  if (!user) {
    return <div className="p-6">Please sign in to view this page.</div>;
  }
  if (!userData)
    return <div>404</div>;


  return (
    // flex item allow to shrink grow
    // only have max as 2xl if the size is medium || large
    <>
      <Head>
        <title>{userData.username}</title>
      </Head>
      <PageLayout>
        <header className="flex justify-between items-center px-8 py-3 border-b border-slate-300 text-sm bg-white">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="text-3xl font-bold font-serif">Medium</div>
            </Link>
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

        <div className="flex max-w-6xl mx-auto pt-12 px-4">
          {/* Left: Main profile content */}
          <div className="flex-1">
            {/* Username as heading */}
            <h1 className="text-5xl font-bold mb-10">{userData.username ?? ""}</h1>

            {/* Tabs (optional like Home, Lists, Following) */}
            <div className="flex space-x-6 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("home")}
                className={`pb-2 transition-colors ${
                  activeTab === "home" ? "border-b-2 border-black text-black font-semibold" : "text-gray-500"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("lists")}
                className={`pb-2 transition-colors ${
                  activeTab === "lists" ? "border-b-2 border-black text-black font-semibold" : "text-gray-500"
                }`}
              >
                Lists
              </button>
              <button
                onClick={() => setActiveTab("following")}
                className={`pb-2 transition-colors ${
                  activeTab === "following" ? "border-b-2 border-black text-black font-semibold" : "text-gray-500"
                }`}
              >
                Following
              </button>
            </div>

            {/* User Posts */}
            {activeTab === "home" && <ProfileFeed userId={userData.id} />}
            {activeTab === "lists" && <SavedPostsFeed />}
            {activeTab === "following" && <FollowingList userId={userData.id} />}
          </div>

          <div className="min-h-screen border-l border-slate-200 ml-6" />

          {/* Right: Sidebar with avatar and edit profile */}
          <div className="w-64 pl-12">
            <div className="flex flex-col items-center">
              <Link href={`/@${userData.username}`}>
                <Image
                  src={userData.profilePicture}
                  alt={`${userData.username ?? ""}'s profile picture`}
                  width={80}
                  height={80}
                  className="rounded-full mb-3"
                />
                <div className="text-lg font-medium">{userData.username ?? ""}</div>
              </Link>
              {isOwner ? (
                <button className="text-green-600 text-sm mt-1 hover:underline">
                  Edit profile
                </button>
              ) : (
                <button
                  onClick={() => {
                    toggleFollowMutation.mutate({ userId: userData.id });
                  }}
                  disabled={toggleFollowMutation.isPending}
                  className={`text-sm mt-1 rounded-full px-4 py-1 border ${
                    isFollowing
                      ? "border-gray-400 text-gray-600"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {toggleFollowMutation.isPending
                    ? "Loading..."
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>
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