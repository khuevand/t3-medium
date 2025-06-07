import { Lock, Heart, MessageCircle, Bookmark, X, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { RouterOutputs } from "~/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const postWithComments = post as typeof post & { commentCount?: number };
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const utils = api.useUtils();

  // ✅ Load saved status via useQuery
  const { data: initiallySaved } = api.post.isSaved.useQuery(
    { postId: post.id },
    { enabled: !!post?.id }
  );

  // ✅ Keep local state in sync
  useEffect(() => {
    if (typeof initiallySaved === "boolean") {
      setIsSaved(initiallySaved);
    }
  }, [initiallySaved]);

  const toggleSaveMutation = api.post.toggleSave.useMutation({
    onSuccess: (data) => {
      setIsSaved(data.saved);
      toast.success(data.saved ? "Saved to reading list" : "Removed from reading list");
      void utils.post.isSaved.invalidate({ postId: post.id });
    },
    onError: () => {
      toast.error("Failed to update reading list");
    },
  });

  const saveToReadingList = () => {
    toggleSaveMutation.mutate({ postId: post.id });
  };

  return (
    <Link href={`/post/${post.id}`}>
      <div
        key={post.id}
        className="flex flex-col gap-2 border-b border-slate-300 p-4 hover:bg-gray-50 transition-colors"
      >
        {/* Author + Publication Line */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href={`/@${author.username}`}>
            <Image
              src={author.profilePicture}
              alt={`@${author.username}'s profile picture`}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full"
            />
          </Link>
          <span>
            In <span className="font-medium">Coding Beauty</span> by {author.username}
          </span>
        </div>

        {/* Post Title */}
        <h3 className="text-lg font-bold text-black">
          {post.title ?? post.content.slice(0, 80)}
        </h3>

        {/* Post Subtitle */}
        <p className="text-sm text-gray-600">
          {post.subtitle ?? "This is the subtitle"}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span>⭐</span>
            <span>{dayjs(post.createdAt).format("MMM D")}</span>
          </div>

          <div className="flex items-center gap-2" title={`${post.claps ?? 0} claps`}>
            <Heart className="w-5 h-5" />
            <span>{post.claps ?? 0}</span>
          </div>

          <div
            className="flex items-center gap-2"
            title={`${postWithComments.commentCount ?? 0} comments`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{postWithComments.commentCount ?? 0}</span>
          </div>

          <div className="ml-auto flex items-center gap-6 relative">
            <span title="Not interested">
              <X className="w-5 h-5 cursor-pointer" />
            </span>

            <div className="relative">
              <span title="Save">
                <Bookmark
                  className="w-5 h-5 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSaveDropdown((prev) => !prev);
                  }}
                />
              </span>

              {showSaveDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 text-sm">
                  <div
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      isSaved ? "text-green-600 font-medium" : "text-gray-700"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      saveToReadingList();
                      setShowSaveDropdown(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>Reading list</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <span title="More options">
              <MoreHorizontal className="w-5 h-5 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostView;
