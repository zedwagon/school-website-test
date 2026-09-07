"use client";

import clsx from "clsx";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      className={clsx(
        "fixed right-6 bottom-6 rounded-full bg-primary p-3 text-white shadow-lg transition-all duration-300",
        "cursor-pointer hover:bg-primary/80",
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
      onClick={scrollToTop}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
