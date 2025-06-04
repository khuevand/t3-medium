// import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import dayjs from "dayjs";
import Image from "next/image";
import type { RouterOutputs } from "~/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
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

export default PostView;