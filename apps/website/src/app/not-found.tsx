"use client";

import { Button } from "@school/ui";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="mb-2 font-bold text-3xl md:text-4xl">Page Not Found</h1>
      <p className="mb-6 text-muted-foreground">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button className="cursor-pointer transition-colors hover:bg-primary/90">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
