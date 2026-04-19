"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Companions", href: "/companions" },
  { label: "Subscription", href: "/subscription" },
  { label: "My Journey", href: "/my-journey" },
];

const prefetchRoutes = [
  "/companions",
  "/companions/new",
  "/subscription",
  "/my-journey",
];

const NavItems = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    prefetchRoutes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  return (
    <nav className="flex items-center gap-4">
      {navItems.map(({ label, href }) => (
        <Link
          href={href}
          key={label}
          prefetch
          className={cn(pathname === href && "text-primary font-semibold")}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default NavItems;
