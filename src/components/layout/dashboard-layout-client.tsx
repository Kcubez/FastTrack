"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut, LayoutDashboard, Users, Menu, Zap, PenSquare, BookOpen,
  Settings, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, adminOnly: false, userOnly: false },
  { title: "Create Content", href: "/dashboard/create", icon: PenSquare, adminOnly: false, userOnly: true },
  { title: "Content Library", href: "/dashboard/library", icon: BookOpen, adminOnly: false, userOnly: true },
  { title: "User Management", href: "/admin/users", icon: Users, adminOnly: true, userOnly: false },
  { title: "Settings", href: "/dashboard/settings", icon: Settings, adminOnly: false, userOnly: false },
];

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleSignOut = async () => {
    setIsLogoutModalOpen(false);
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const isAdmin = session?.user?.role === "admin";
  const filtered = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false; // hide admin-only from users
    if (item.userOnly && isAdmin) return false;   // hide user-only from admins
    return true;
  });

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
          isActive
            ? "bg-violet-600/20 text-violet-300 font-medium"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full" />
        )}
        <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`} />
        <span className="flex-1">{item.title}</span>
        {isActive && <ChevronRight className="w-4 h-4 text-violet-400/50" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-white tracking-wide text-xl">FastTrack</span>
          <p className="text-xs text-slate-500 font-medium">AI Content Writer</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto mt-4 px-3 space-y-1">
        {filtered.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Role badge */}
      <div className="px-4 pb-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          session?.user?.role === "admin"
            ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
        }`}>
          {session?.user?.role === "admin" ? "⚡ Admin" : "✍️ Content Generator"}
        </span>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
          <Avatar className="w-9 h-9 border border-slate-700">
            <AvatarImage src={session?.user?.image ?? ""} />
            <AvatarFallback className="bg-violet-500/20 text-violet-400 font-bold">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium text-slate-200 truncate text-sm">{session?.user?.name}</span>
            <span className="text-[10px] text-slate-500 truncate">{session?.user?.email}</span>
          </div>
        </div>

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Sign Out</span>
        </button>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        description="Are you sure you want to sign out? You will need to log back in to access your content."
        confirmText="Sign Out"
        variant="danger"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 min-h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">FastTrack</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" />}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </SheetTrigger>
            <SheetContent side="left" className="bg-slate-900 border-none p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
