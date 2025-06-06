import Image from "next/image";
import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  UserRound,
  BookmarkCheck,
  SquareChartGantt,
  ChartColumnBig,
} from "lucide-react";


const Sidebar = () => {
  return (
    <aside className="w-full max-w-md flex flex-col gap-11 px-4 py-6 text-sm">
        {/* 1. Staff Picks */}
        <div>
            <h2 className="font-semibold mb-3 text-base">Staff Picks</h2>
            <ul className="space-y-2 text-sm">
            <li><a href="#" className="font-bold hover:underline">Why ChatGPT Creates Scientific Citations — That Don't Exist</a></li>
            <span>⭐</span> <span className="text-sm text-gray-600">1 day ago</span>
            <li><a href="#" className="font-bold hover:underline">How to — Finally — Change Your Name</a></li>
            <span>⭐</span> <span className="text-sm text-gray-600">March 4</span>
            <li><a href="#" className="font-bold hover:underline">Write with Medium June Challenge</a></li>
            <div className="text-sm text-gray-600">May 30</div>
            </ul>
        </div>

        {/* 2. Recommended Topics */}
        <div>
            <h2 className="font-semibold mb-3 text-base">Recommended Topics</h2>
            <div className="flex flex-wrap gap-2">
            {[
                "Programming", "Self Improvement", "Data Science", "Writing",
                "Relationships", "Technology", "Cryptocurrency", "Romance", "Sci-fi"
            ].map((topic) => (
                <span
                key={topic}
                className="bg-slate-200 px-3 py-1 rounded-full text-xs hover:bg-slate-300 cursor-pointer"
                >
                {topic}
                </span>
            ))}
            </div>
        </div>

        {/* 3. Who to Follow */}
        <div>
            <h2 className="font-semibold mb-3 text-base">Who to follow</h2>

            {[{
            name: "Cat lover",
            desc: "My diary ‘Theatre Kittens’...",
            img: "/atsumu.png"
            }, {
            name: "Wise & Well",
            desc: "Insights into health and wellness",
            img: "/nutritionist.png"
            }].map((person, i) => (
            <div key={i} className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                <Image src={person.img} alt={person.name} width={40} height={40} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-gray-500 text-xs">{person.desc}</p>
                </div>
                </div>
                <button className="border px-3 py-1 rounded-full text-sm hover:bg-gray-100">Follow</button>
            </div>
            ))}

            <a href="#" className="text-sm text-green-700 mt-2 inline-block hover:underline">See more suggestions</a>
        </div>

        {/* 4. Recently Saved */}
        <div>
            <h2 className="font-semibold mb-3 text-base">Recently saved</h2>
            <div>
            <div className="flex items-center gap-3 mb-1">
                <Image src="/cat.png" alt="Language Lab" width={20} height={20} className="rounded-sm" />
                <span className="text-xs text-gray-600">In Animal Study Lab, PhD</span>
            </div>
            <p className="font-semibold text-sm leading-tight mb-1">
                How to make friend with a cat
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>⭐</span> <span>May 22</span>
            </p>
            </div>
            <a href="#" className="text-sm text-green-700 mt-2 inline-block hover:underline">See all (1)</a>
        </div>
        </aside>
  );
};

// components/UserDropdown.tsx (or inside the same file above Home)

export const UserDropdown = ({ username }: { username: string }) => {
  return (
    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
      <Link
        href={`/@${username}`}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          <UserRound className="w-4 h-4" />
          <span>Profile</span>
        </div>
      </Link>

      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <BookmarkCheck className="w-4 h-4" />
        <span>Library</span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <SquareChartGantt className="w-4 h-4" />
        <span>Stories</span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200">
        <ChartColumnBig className="w-4 h-4" />
        <span>Stats</span>
      </div>

      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</div>

      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200">
        Help
      </div>

      <SignOutButton>
        <button className="flex flex-col w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Sign out
          <span className="text-xs text-gray-500">@{username}</span>
        </button>
      </SignOutButton>
    </div>
  );
};


export default Sidebar;
