import type { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { Bell, Search, SquarePen, Heart, MessageCircle, Bookmark, Share, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { UserDropdown } from "~/components/sidebar";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {

  {/* Set up router, post, user, author of the post */}
  const router = useRouter();
  const postId = router.query.id as string;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const { user } = useUser();

  const { data, isLoading } = api.post.getById.useQuery({ id: postId });
  const { data: followerStats } = api.user.getFollowStats.useQuery(
    { userId: data?.author.id ?? "" },
    { enabled: !!data }
  );

  // clap part
  const [hasClapped, setHasClapped] = useState(false);
  const [clapCount, setClapCount] = useState(data?.post.claps ?? 0);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Post not found.</div>;
  
  const clapMutation = api.post.clap.useMutation({
    onSuccess: async (updatedClaps) => {
      setClapCount(updatedClaps); // update local state with server value
      await utils.post.getById.invalidate({ id: postId }); // optional re-fetch
    },
  });

  // author, post extracted from data

  const { post, author,} = data;
  const isAuthor = user?.id === author.id;

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(followerStats?.followers ?? 0);
  const [followingCount, setFollowingCount] = useState(followerStats?.following ?? 0);

  const [commentContent, setCommentContent] = useState("");
  const utils = api.useUtils();
  const { data: comments } = api.comment.getByPostId.useQuery({ postId });
  const commentCount = comments?.length ?? 0;

  {/* Generate comment section */}
  const createComment = api.comment.create.useMutation({
    onSuccess: async () => {
      setCommentContent("");
      await utils.post.getById.invalidate({ id: postId }); // refresh post + comment count
    },
  });

  const [authorImages, setAuthorImages] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchAvatars = async () => {
      if (!comments) return;

      const usernamesToFetch = comments
        .map((c) => c.authorName)
        .filter((name) => name && !authorImages[name]);

      const uniqueNames = [...new Set(usernamesToFetch)];

      for (const username of uniqueNames) {
        try {
          const user = await utils.profile.getUserByUserName.fetch({ username });
          console.log(user);
          setAuthorImages((prev) => ({ ...prev, [username]: user.profilePicture }));
        } catch (e) {
          console.error("Failed to fetch user image for", username);
        }
      }
    };

    fetchAvatars();
  }, [comments]);

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <header className="flex justify-between items-center px-8 py-3 border-b border-slate-300 text-sm bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="text-3xl font-bold font-serif">Medium</div>
          </Link>
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
          <button onClick={() => router.push("/write")} className="group flex items-center gap-1 text-gray-500 hover:text-black">
            <SquarePen className="w-5 h-5 group-hover:text-black" />
            <span className="text-sm">Write</span>
          </button>
          <button className="text-gray-500 hover:text-black p-2 rounded-full">
            <Bell className="w-5 h-5" />
          </button>
          {user && (
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
          )}
        </nav>
      </header>

      <main className="flex justify-center">
        <div className="max-w-2xl w-full px-6 py-10">
          <h1 className="text-4xl font-bold mb-5">{post.title}</h1>
        
          {/* First section, only show if user is not author */}
          {isAuthor ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Image
              src={author.profilePicture}
              alt="Author"
              className="w-8 h-8 rounded-full"
              width={24}
              height={24}
            />
            <span>{author.username ?? "Unknown"}</span> ·
            <span>{dayjs(post.publishedAt).fromNow()}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Image
                src={author.profilePicture}
                alt="Author"
                className="w-8 h-8 rounded-full"
                width={24}
                height={24}
              />
              <span className="font-semibold text-black">{author.username ?? "Unknown"}</span> ·
              <span>{dayjs(post.publishedAt).fromNow()}</span>
            </div>
            <button
              onClick={() => {
                setIsFollowing(!isFollowing);
                setFollowerCount((prev) => prev + (isFollowing ? -1 : 1));
                setFollowingCount((prev) => prev + (isFollowing ? -1 : 1));
              }}
              className={`rounded-full px-4 py-1 text-sm border ${
                isFollowing
                  ? "border-gray-400 text-gray-600"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        )}

          <article className="prose max-w-none text-lg leading-relaxed whitespace-pre-wrap mb-10">
            {post.content}
          </article>

          <div className="border-t border-b border-gray-300 py-4 flex justify-between items-center text-xs text-gray-500 mt-1">
            {/* LEFT side: Heart + Comments */}
            <div className="flex gap-6 items-center">
              <div
                className="flex items-center gap-2 cursor-pointer"
                title={`${clapCount} claps`}
                onClick={() => {
                  const increment = !hasClapped;
                  setHasClapped(increment);
                  setClapCount((prev) => prev + (increment ? 1 : -1));
                  clapMutation.mutate({ postId, increment });
                }}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${hasClapped ? "text-pink-600 fill-pink-600" : "text-gray-500"}`}
                />
                <span>{clapCount}</span>
              </div>

              <div className="flex items-center gap-2" title={`${commentCount ?? 0} comments`}>
                <MessageCircle className="w-5 h-5" />
                <span>{commentCount ?? 0}</span>
              </div>
            </div>

            {/* RIGHT side: Bookmark, Share, More */}
            <div className="flex gap-6 items-center">
              <div className="relative">
                <Bookmark
                  className="w-5 h-5 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSaveDropdown((prev) => !prev);
                  }}
                />
                {showSaveDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 text-sm">
                    <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-600 text-white flex items-center justify-center rounded text-xs font-bold">
                          ✓
                        </div>
                        <span>Reading list</span>
                      </div>
                      <span role="img" aria-label="lock">🔒</span>
                    </div>
                    <div className="px-3 py-2 text-green-700 hover:underline cursor-pointer">
                      Create new list
                    </div>
                  </div>
                )}
              </div>

              <span
                title="Copy link"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
              >
                <Share className="w-5 h-5 cursor-pointer hover:text-green-600" />
              </span>

              <span title="More options">
                <MoreHorizontal className="w-5 h-5 cursor-pointer" />
              </span>
            </div>
          </div>
  
          {/* Second section, only show if user is author */}
          <div className="pt-6 mt-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={author.profilePicture ?? "/default-profile.png"}
                alt="Author"
                className="w-16 h-16 rounded-full object-cover"
                width={64}
                height={64}
              />
              <div>
                <p className="font-bold text-lg">Written by {author.username ?? "Unknown"}</p>
                <p className="text-sm text-gray-500">
                  {followerCount} followers · {followingCount} following
                </p>
              </div>
            </div>

            {isAuthor ? (
                    <Link href={`/@${user.username}`}>
                      <button className="bg-black text-white rounded-full px-4 py-2 text-sm">
                        Edit profile
                      </button>
                    </Link>
            ) : (
              <button
                onClick={() => {
                  setIsFollowing(!isFollowing);
                  setFollowerCount((prev) => prev + (isFollowing ? -1 : 1));
                  setFollowingCount((prev) => prev + (isFollowing ? -1 : 1));
                }}
                className={`rounded-full px-4 py-2 text-sm border ${
                  isFollowing
                    ? "border-gray-400 text-gray-600"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          <div className="pt-12">
            <p className="text-sm text-gray-600 mb-2">
              {commentCount ?? 0} response{(commentCount ?? 0) !== 1 && "s"}
            </p>
            <div className="flex items-center gap-2">
              <Image
                src={user?.imageUrl ?? "/default-profile.png"}
                alt="User"
                className="w-8 h-8 rounded-full"
                width={24}
                height={24}
              />
              <input
                className="flex-1 border rounded-full px-4 py-2 text-sm"
                placeholder="What are your thoughts?"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commentContent.trim() !== "") {
                    createComment.mutate({
                      postId,
                      content: commentContent.trim(),
                    });
                  }
                }}
              />
            </div>

            <div className="mt-6 space-y-6">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 text-sm text-gray-800">
                  <Image
                    src={authorImages[comment.authorName] ?? "/default-profile.png"}
                    alt="Commenter"
                    className="w-8 h-8 rounded-full object-cover"
                    width={32}
                    height={32}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.authorName}</span>
                      {comment.authorId === author.id && (
                        <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-medium">
                          Author
                        </span>
                      )}
                      <span className="text-gray-400 text-xs">· {dayjs(comment.createdAt).fromNow()}</span>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <Heart className="w-4 h-4" />
                      <button className="hover:underline">Reply</button>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 cursor-pointer text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

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

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
