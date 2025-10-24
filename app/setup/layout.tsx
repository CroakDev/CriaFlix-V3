"use client";

import { SidebarMenu } from "../components/Sidebar";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth"; // Importando o tipo Session do next-auth

function RootLayout({ children, session }: { children: React.ReactNode; session?: Session | null }) {
    return (
        <div className="flex flex-col h-screen">
            <SessionProvider session={session ?? undefined}>
                    <main>
                        {children}
                    </main>
            </SessionProvider>
        </div>
    );
}

export default RootLayout;
