import { Lock, Heart, MessageCircle, Bookmark, X, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import Image from "next/image";
import { useState } from "react";
import type { RouterOutputs } from "~/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const postWithComments = post as typeof post & { commentCount?: number };
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);

    return (
    <Link href={`/post/${post.id}`}>
      <div
        key={post.id}
        className="flex flex-col gap-2 border-b border-slate-300 p-4 hover:bg-gray-50 transition-colors"
      >
        {/* Author + Publication Line */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Image
            src={author.profilePicture}
            alt={`@${author.username}'s profile picture`}
            width={20}
            height={20}
            className="w-5 h-5 rounded-full"
          />
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
          {/* Date + Star */}
          <div className="flex items-center gap-2" title="Recommended">
            <span>⭐</span>
            <span>{dayjs(post.createdAt).format("MMM D")}</span>
          </div>

          {/* Claps */}
          <div
            className="flex items-center gap-2"
            title={`${post.claps ?? 0} claps`}
          >
            <span title={`${post.claps ?? 0} heart`}>
                <Heart className="w-5 h-5" />
            </span>
            <span>{post.claps ?? 0}</span>
          </div>

          {/* Comments */}
          <div
            className="flex items-center gap-2"
            title={`${postWithComments.commentCount ?? 0} comments`}
          >
            <span title={`${postWithComments.commentCount ?? 0} comment`}>
                <MessageCircle className="w-5 h-5" />
            </span>
            <span>{postWithComments.commentCount ?? 0}</span>
          </div>

          {/* Action icons */}
          <div className="ml-auto flex items-center gap-6 relative">
            <span title="Not interested">
                <X className="w-5 h-5 cursor-pointer" />
            </span>

            {/* Bookmark with dropdown */}
            <div className="relative">
                <span title="Save">
                    <Bookmark className="w-5 h-5 cursor-pointer"
                        onClick={(e) => {
                        e.preventDefault(); // prevent link click
                        setShowSaveDropdown((prev) => !prev);
                        }}
                    />
                </span>

              {showSaveDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 text-sm">
                  <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-600 text-white flex items-center justify-center rounded text-xs font-bold">
                        ✓
                      </div>
                      <span>Reading list</span>
                    </div>
                    <span role="img" aria-label="lock">
                      🔒
                    </span>
                  </div>
                  <div className="px-3 py-2 text-green-700 hover:underline cursor-pointer">
                    Create new list
                  </div>
                </div>
              )}
            </div>
            <span title="More options">
                <MoreHorizontal
                className="w-5 h-5 cursor-pointer"
                />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostView;