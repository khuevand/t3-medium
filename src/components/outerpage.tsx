import type { PropsWithChildren } from "react";

// components/fullpagelayout.tsx
export const FullPageLayout = (props: PropsWithChildren<unknown>) => {
  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-[#f7f4ed] text-black px-4">
      {props.children}
    </main>
  );
};
