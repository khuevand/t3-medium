import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren<unknown>) => {
    return(
        <main className="flex h-screen justify-center">
            <div className="h-full w-full md:max-w-2xl bg-black border-x border-slate-400 overflow-y-scroll">
                {props.children}
            </div>
        </main>
    );
};