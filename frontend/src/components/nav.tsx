"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export function Nav() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const username = user?.username ?? user?.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "";

  const publicLinks = [{ href: "/", label: "Feed" }];
  const authLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/activity", label: "My Activity" },
    { href: `/users/${username}`, label: "My Profile" },
  ];

  const renderLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <Button
        key={href}
        asChild
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        className={cn("w-full justify-start", isActive && "font-medium")}
      >
        <Link href={href}>{label}</Link>
      </Button>
    );
  };

  return (
    <nav className="flex flex-col gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Menu className="size-4" />
      </Button>

      {open && (
        <div className="flex flex-col gap-1">
          {publicLinks.map(renderLink)}
          {isSignedIn && authLinks.map(renderLink)}
        </div>
      )}
    </nav>
  );
}