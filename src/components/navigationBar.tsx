import { useRouter } from "next/router";
import { Plus } from "lucide-react";

{/* Topic Slider */}
const TopicSlider = () => {
  const router = useRouter();
  const currentTag = router.query.tag as string;

  const handleTagClick = (tag: string) => {
    router.push({
      pathname: router.pathname,
      query: { tag },
    });
  };

  return (
    <div className="flex gap-6 border-b border-gray-200 px-4 py-2 text-sm font-medium">
      {/* Plus icon (navigate to ?tag=add or manage view) */}
      <button
        className={`p-2 text-gray-500 hover:text-black ${
          currentTag === "add" ? "text-black" : ""
        }`}
        onClick={() => handleTagClick("add")}
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Tab buttons */}
      {["For you", "Following", "Featured", "Programming"].map((tab) => {
        const tag = tab.toLowerCase().replace(/\s+/g, "-"); // e.g. "for you" -> "for-you"
        const isActive = currentTag === tag;

        return (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`pb-1 transition-colors ${
              isActive
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default TopicSlider;
