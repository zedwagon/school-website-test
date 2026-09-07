import { getSession } from "@school/api/auth/session";
import type { ReactNode } from "react";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Footer } from "@/components/scaffolding/Footer";
import { Navigation } from "@/components/scaffolding/Navigation";

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await getSession();

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navigation user={session?.user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
