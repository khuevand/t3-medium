import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { api } from "~/utils/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { CirclePlus } from "lucide-react";
import { LoadingSpinnerLOAD, LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { Bell } from "lucide-react";
import { useRouter } from "next/router";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const ctx = api.useContext();
  const router = useRouter();

  const postMutation = api.post.create.useMutation({
    onSuccess: (data) => {
      setTitle("");
      setContent("");
      toast.success("Post published successfully!");
      void ctx.post.getAll.invalidate();
      setIsRedirecting(true);
      void router.push(`/post/${data.id}`); 
    },
    onError: (e) => {
      const titleError = e.data?.zodError?.fieldErrors?.title?.[0];
      const contentError = e.data?.zodError?.fieldErrors?.content?.[0];
      toast.error(titleError ?? contentError ?? "Failed to post! Try again.");
    },
  });

  if (!user) return null;

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  return (
    <PageLayout>
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Left: Logo + Draft */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="text-3xl font-bold font-serif">Medium</div>
            </Link>
            <span className="text-sm text-gray-500">Draft</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => postMutation.mutate({ title, content })}
              disabled={
                postMutation.isPending ||
                title.trim() === "" ||
                content.trim() === ""
              }
              title={
                title.trim() === "" || content.trim() === ""
                  ? "Publish is allowed when you enter the content"
                  : ""
              }
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors
                ${
                  title.trim() === "" || content.trim() === ""
                    ? "bg-green-200 text-white"
                    : "bg-green-600 text-white hover:bg-green-700"
                }
                ${postMutation.isPending ? "opacity-50" : ""}
              `}
            >
              {postMutation.isPending ? <LoadingSpinnerLOAD /> : "Publish"}
            </button>

            <button
              className="p-2 text-xl font-bold text-gray-600 hover:bg-gray-100 rounded-full"
              aria-label="More options"
            >
              …
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <Bell className="w-5 h-5" />
            </button>

            <Image
              src={user.imageUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full cursor-pointer"
              width={32}
              height={32}
            />
          </div>
        </div>
      </header>

    
      <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto text-gray-800">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-serif font-bold placeholder-gray-400 outline-none mb-6"
        />

        <div className="flex items-start gap-3 text-lg text-gray-700">
          <CirclePlus className="w-6 h-6 mt-1 text-gray-400" />
          <textarea
            placeholder="Tell your story..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[60vh] placeholder-gray-400 outline-none resize-none"
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default CreatePostWizard;
