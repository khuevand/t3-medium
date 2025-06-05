import Image from "next/image";

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

export default Sidebar;
