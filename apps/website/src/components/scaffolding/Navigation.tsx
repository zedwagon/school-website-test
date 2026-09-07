"use client";

import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@school/ui";
import clsx from "clsx";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useState,
} from "react";

/* ---------------- NavButton Component ---------------- */
interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
  isTransparent?: boolean;
}

function NavButton({
  active,
  isTransparent,
  children,
  className,
  ...props
}: NavButtonProps) {
  return (
    <button
      className={clsx(
        "flex cursor-pointer items-center space-x-1 px-3 py-2 text-sm transition-all duration-300 sm:text-base",
        isTransparent
          ? active
            ? "font-semibold text-white"
            : "text-white/80 hover:text-white"
          : active
            ? "font-semibold text-primary"
            : "text-muted-foreground hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------- NavLink Component ---------------- */
interface NavLinkProps extends LinkProps {
  active?: boolean;
  children: ReactNode;
  className?: string;
}

function NavLink({ active, children, className, ...props }: NavLinkProps) {
  return (
    <Link
      {...props}
      className={clsx(
        "block cursor-pointer whitespace-nowrap px-4 py-2 text-base transition-colors hover:bg-muted hover:text-primary sm:text-sm",
        active ? "font-semibold text-primary" : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ---------------- Navigation Component ---------------- */
interface NavGroup {
  label: string;
  links: { label: string; href: string }[];
}

export function Navigation({}: {
  user?: { role: string; staffDepartment?: string | null };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled;

  // Simplified navigation: Portal always goes to /login,
  // which then redirects if already logged in.
  const portalHref = "/login";

  const navGroups: NavGroup[] = [
    {
      label: "About",
      links: [
        { label: "Vision & Mission", href: "/vision-mission" },
        { label: "History, Hymn, Logo", href: "/history-hymn-logo" },
        { label: "Board of Trustees", href: "/board-of-trustees" },
        { label: "Administration & Faculty", href: "/administration-faculty" },
        {
          label: "Accreditation & Achievements",
          href: "/accreditation-achievements",
        },
      ],
    },
    {
      label: "Admissions",
      links: [
        { label: "Basic Education Program", href: "/basic-education" },
        { label: "Scholarship Program", href: "/scholarship" },
        { label: "Registrar", href: "/registrar" },
        { label: "Accounting", href: "/accounting" },
      ],
    },
    {
      label: "Campus Life",
      links: [
        { label: "News & Events", href: "/news-events" },
        { label: "Organizations", href: "/organizations" },
        { label: "Facilities", href: "/facilities" },
        { label: "Alumni Testimonials", href: "/alumni-testimonials" },
        { label: "School Calendar", href: "/school-calendar" },
      ],
    },
  ];

  const toggleMobileGroup = (label: string) => {
    setOpenMobileGroup((prev) => (prev === label ? null : label));
  };

  useEffect(() => {
    setIsOpen(false);
    setOpenMobileGroup(null);
  }, [pathname]);

  return (
    <nav
      className={clsx(
        "z-50",
        isOpen
          ? "relative lg:sticky lg:top-0 lg:border-border lg:border-b lg:bg-background/95 lg:backdrop-blur-md lg:shadow-sm lg:transition-all lg:duration-300"
          : clsx(
              "transition-all duration-300",
              isTransparent
                ? "absolute top-0 left-0 right-0 bg-transparent border-transparent py-2 lg:py-4 text-white"
                : "sticky top-0 border-border border-b bg-background/95 backdrop-blur-md shadow-sm",
            ),
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link className="flex items-center space-x-3 lg:space-x-4" href="/">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full lg:h-14 lg:w-14">
                <Image
                  alt="MPPSI Logo"
                  fill
                  priority
                  sizes="(max-width: 1024px) 40px, 56px"
                  src="/logo.webp"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <span
                className={clsx(
                  "font-black text-sm leading-snug lg:text-base transition-colors duration-300",
                  isTransparent ? "text-white" : "text-foreground",
                )}
              >
                Mother Perpetua <br />
                Parochial School Inc.
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 text-base lg:flex">
            {navGroups.map((group) => (
              <Popover key={group.label}>
                <PopoverTrigger asChild>
                  <NavButton
                    active={group.links.some((link) => link.href === pathname)}
                    isTransparent={isTransparent}
                  >
                    {group.label}
                    <ChevronDown className="h-4 w-4" />
                  </NavButton>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-60 p-2">
                  <div className="flex flex-col py-1">
                    {group.links.map((link) => (
                      <PopoverClose asChild key={link.label}>
                        <NavLink
                          active={pathname === link.href}
                          href={link.href}
                        >
                          {link.label}
                        </NavLink>
                      </PopoverClose>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            ))}
            <Link href="/contact">
              <NavButton
                active={pathname === "/contact"}
                isTransparent={isTransparent}
              >
                Contact
              </NavButton>
            </Link>
            <Link href={portalHref}>
              <NavButton
                active={
                  pathname.startsWith("/dashboard") ||
                  pathname.startsWith("/login")
                }
                isTransparent={isTransparent}
              >
                Portal
              </NavButton>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              className={clsx(
                "cursor-pointer transition-colors duration-300",
                isTransparent
                  ? "text-white hover:bg-white/10 hover:text-white/90"
                  : "text-foreground",
              )}
              onClick={() => setIsOpen(!isOpen)}
              size="sm"
              variant="ghost"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-white p-6 lg:hidden">
            <div>
              <div className="mb-4 flex justify-end">
                <Button
                  className="cursor-pointer"
                  onClick={() => setIsOpen(false)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-3">
                {navGroups.map((group) => (
                  <div className="space-y-1" key={group.label}>
                    <Button
                      className="w-full cursor-pointer justify-between font-semibold text-muted-foreground transition-colors hover:text-primary"
                      onClick={() => toggleMobileGroup(group.label)}
                      size="sm"
                      variant="ghost"
                    >
                      {group.label}
                      <ChevronDown
                        className={clsx(
                          "h-4 w-4 transition-transform",
                          openMobileGroup === group.label ? "rotate-180" : "",
                        )}
                      />
                    </Button>

                    <div
                      className={clsx(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        openMobileGroup === group.label
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      {group.links.map((link) => (
                        <NavLink
                          active={pathname === link.href}
                          className="py-2 pl-6 text-base"
                          href={link.href}
                          key={link.label}
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}

                <Link href="/contact">
                  <Button
                    className="mt-6 w-full cursor-pointer text-center hover:text-primary"
                    size="lg"
                    variant="outline"
                  >
                    Contact
                  </Button>
                </Link>
                <Link href={portalHref}>
                  <Button
                    className="mt-2 w-full cursor-pointer text-center font-semibold hover:text-primary"
                    size="lg"
                    variant="ghost"
                  >
                    Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Footer at bottom */}
            <div className="mt-4 flex flex-row items-center justify-center space-x-4 border-border border-t pt-4 text-center">
              <Link
                className="flex cursor-pointer flex-row items-center space-x-4"
                href="/" // close mobile menu
                onClick={() => setIsOpen(false)}
              >
                {/* Logo */}
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    alt="MPPSI Logo"
                    fill
                    priority
                    sizes="40px"
                    src="/logo.webp"
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* School info */}
                <div className="flex flex-col text-left">
                  <span className="font-bold text-foreground text-sm">
                    Mother Perpetua Parochial School Inc.
                  </span>
                  <p className="text-muted-foreground text-xs">
                    Brgy. Lual Pob. Mauban, Quezon 4330 <br />
                    (042) 731 9482 <br />
                    motherperpetua_mauban@yahoo.com
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
