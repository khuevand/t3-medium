import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren<unknown>) => {
    return(
        <main className="flex min-h-screen justify-center bg-white text-black">
            <div className="h-full w-full border-x border-slate-300 overflow-y-scroll">
                {props.children}
            </div>
        </main>
    );
};