import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowLeftRight,
  ClipboardList,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    ["/", "Dashboard", LayoutDashboard],
    ["/purchases", "Purchases", ShoppingCart],
    ["/transfers", "Transfers", ArrowLeftRight],
    ["/operations", "Assignments & Expenditures", ClipboardList],
  ];

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-slate-950 text-white flex-col fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="p-5 lg:p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Shield size={21} />
            </div>

            <div>
              <div className="font-bold tracking-tight">
                Asset Command
              </div>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Military Asset Management
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 lg:p-4 space-y-1.5 flex-1 overflow-y-auto">
          <p className="px-3 pt-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Main Menu
          </p>

          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      }
                    />

                    <span className="text-sm font-medium truncate">
                      {label}
                    </span>
                  </div>

                  {isActive && <ChevronRight size={16} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <UserCircle size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {user?.username}
              </p>

              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-600/20 hover:text-red-400 text-slate-300 py-2.5 rounded-xl transition text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-[280px] bg-slate-950 text-white z-50 md:hidden transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={21} />
            </div>

            <div>
              <div className="font-bold">Asset Command</div>
              <p className="text-[10px] text-slate-400">
                Asset Management
              </p>
            </div>
          </div>

          <button
            onClick={closeMobile}
            className="w-9 h-9 rounded-lg hover:bg-slate-800 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1.5">
          <p className="px-3 pt-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Main Menu
          </p>

          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-900"
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <UserCircle size={24} className="text-blue-400" />

            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.username}
              </p>

              <p className="text-[10px] text-slate-400 truncate">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-600/20 text-slate-300 py-2.5 rounded-xl text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 lg:ml-72 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-slate-950 text-white px-4 py-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center"
            >
              <Menu size={21} />
            </button>

            <div className="flex items-center gap-2">
              <Shield size={20} className="text-blue-400" />

              <span className="font-bold text-sm">
                Asset Command
              </span>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <UserCircle size={21} />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-3 sm:p-5 lg:p-7 xl:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}