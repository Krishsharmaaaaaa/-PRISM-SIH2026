"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import clsx from "clsx";
import {
  UploadCloud,
  BarChart3,
  FileOutput,
  X,
} from "lucide-react";
import { useSidebarContext } from "./sidebar-context";

const PROJECT_NAV = [
  { href: "/upload", isRoot: false, label: "AI Cadastral Photogrammetry", icon: UploadCloud },
  { href: "/analytics", isRoot: false, label: "Insights & Dataset History", icon: BarChart3 },
  { href: "/exports", isRoot: false, label: "Download GIS & Survey Data", icon: FileOutput },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = (params?.projectId as string | undefined) || "6aabb5f492fa58e7033199dc";
  const { isMobileOpen, setIsMobileOpen } = useSidebarContext();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex h-full w-72 sm:w-80 lg:w-64 shrink-0 flex-col border-r border-hairline bg-surface select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl lg:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-hairline bg-surfaceMuted/30">
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center hover:opacity-90 transition-opacity"
            title="PRISM Home"
          >
            <img
              src="/images/prism-logo.png"
              alt="PRISM Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-stone hover:text-ink hover:bg-surfaceSunken transition-colors"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-stoneLight">
            Cadastral Navigation
          </p>

          {PROJECT_NAV.map((item) => {
            const href = item.isRoot ? "/" : `/projects/${projectId}${item.href}`;
            const active = item.isRoot ? pathname === "/" : pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setIsMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-2.5 rounded-xl px-3 py-3 text-xs font-semibold transition-all",
                  active
                    ? "bg-oxblood text-white shadow-xs"
                    : "text-ink hover:bg-surfaceSunken hover:text-ink",
                )}
              >
                <item.icon size={17} strokeWidth={active ? 2.2 : 1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-hairline p-3 bg-surfaceMuted/20">
          <div className="flex items-center gap-2.5 rounded-xl p-2.5 bg-white border border-hairline shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oxblood-tint text-xs font-bold text-oxblood shrink-0">
              CS
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-ink">Cadastral Surveyor</p>
              <p className="truncate text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                Live Photogrammetry Session
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

