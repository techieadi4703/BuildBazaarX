import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { ChatLauncher } from "@/components/shared/ChatLauncher";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0 pt-16 md:pt-20">{children}</main>
      <Footer />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
};
