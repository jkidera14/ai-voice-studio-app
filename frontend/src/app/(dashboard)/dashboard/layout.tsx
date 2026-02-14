import "~/styles/globals.css";
import { Providers } from "~/components/providers";
import { Toaster } from "~/components/ui/sonner";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "~/components/ui/sidebar";

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <Providers>
            <SidebarProvider>
                <SidebarTrigger />
                <SidebarInset className="flex h-screen flex-col">
                    {children}
                </SidebarInset>
            </SidebarProvider>
            <Toaster />
        </Providers>
    );
}