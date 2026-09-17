"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import clsx from "clsx";
import {
  Home,
  UploadCloud,
  BarChart3,
  MessageSquareText,
  FileOutput,
  Satellite,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const PROJECT_NAV = [
  { href: "/upload", isRoot: false, label: "AI Cadastral Photogrammetry", icon: UploadCloud },
  { href: "/analytics", isRoot: false, label: "Insights & Dataset History", icon: BarChart3 },
  { href: "/exports", isRoot: false, label: "Download GIS & Survey Data", icon: FileOutput },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = (params?.projectId as string | undefined) || "6aabb5f492fa58e7033199dc";
  const { user } = useAuthStore();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-hairline bg-surface select-none">
      <Link
        href="/"
        className="flex h-16 items-center px-5 border-b border-hairline bg-surfaceMuted/30 hover:bg-surfaceSunken/60 transition-colors cursor-pointer"
        title="PRISM Home"
      >
        <img
          src="/images/prism-logo.png"
          alt="PRISM Logo"
          className="h-8 w-auto object-contain"
        />
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
              className={clsx(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all",
                active
                  ? "bg-oxblood text-white shadow-xs"
                  : "text-ink hover:bg-surfaceSunken hover:text-ink",
              )}
            >
              <item.icon size={16} strokeWidth={active ? 2.2 : 1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hairline p-3 bg-surfaceMuted/20">
        <div className="flex items-center gap-2.5 rounded-lg p-2 bg-white border border-hairline shadow-xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-oxblood-tint text-xs font-bold text-oxblood">
            CS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">Cadastral Surveyor</p>
            <p className="truncate text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live AI Photogrammetry Session
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
