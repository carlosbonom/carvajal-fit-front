"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import {
  PanelLeftClose,
  ChevronRight,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";

import { Logo } from "./icons";

import { cn } from "@/lib/utils";
import { clearUser } from "@/lib/store/slices/userSlice";
import { clearTokens, getAccessToken } from "@/lib/auth-utils";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logout } from "@/services/auth";

// Iconos SVG simples para el sidebar
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const BarChartIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M4 6h16M4 12h16M4 18h16"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M6 18L18 6M6 6l12 12"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const DollarSignIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const VideoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const StoreIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const MarketingIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const SuccessStoriesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

interface MenuItem {
  label: string;
  icon: React.FC<{ className?: string }>;
  path: string;
  badge?: number;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    items: [
      { label: "Dashboard", icon: DashboardIcon, path: "/admin" },
    ],
  },
  {
    title: "El club",
    items: [
      { label: "Cursos", icon: BookOpenIcon, path: "/admin/courses" },
      // { label: "Videos", icon: VideoIcon, path: "/admin/videos" },
      // { label: "Desbloqueos", icon: LockIcon, path: "/admin/unlocks" },
      { label: "Miembros", icon: UsersIcon, path: "/admin/members" },
      { label: "Casos de Éxito", icon: SuccessStoriesIcon, path: "/admin/success-stories" },
    ],
  },
  {
    title: "SUSCRIPCIONES",
    items: [
      { label: "Precios", icon: DollarSignIcon, path: "/admin/pricing" },
      { label: "Reportes", icon: BarChartIcon, path: "/admin/reports" },
    ],
  },
  {
    title: "TIENDAS",
    items: [
      { label: "Market José", icon: StoreIcon, path: "/admin/market/jose" },
      { label: "Market Gabriel", icon: StoreIcon, path: "/admin/market/gabriel" },
    ],
  },
  {
    title: "MARKETING",
    items: [
      { label: "Marketing", icon: MarketingIcon, path: "/admin/marketing" },
    ],
  },
  {
    title: "CONFIGURACIÓN",
    items: [
      { label: "Ajustes", icon: SettingsIcon, path: "/admin/settings" },
    ],
  },
];

export function AdminSidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Obtener inicial del nombre o email
  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "A";
  };

  // Obtener nombre para mostrar
  const getUserName = () => {
    return user?.name || user?.email || "Admin";
  };

  // Obtener rol para mostrar
  const getUserRole = () => {
    if (!user?.role) return "Administrador";
    const roleMap: Record<string, string> = {
      admin: "Administrador",
      customer: "Cliente",
      support: "Soporte",
    };

    return (
      roleMap[user.role] ||
      user.role.charAt(0).toUpperCase() + user.role.slice(1)
    );
  };

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cerrar menú de perfil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    try {
      const token = getAccessToken();

      if (token) {
        await logout(token);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      clearTokens();
      dispatch(clearUser());
      router.push("/");
      router.refresh();
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
        />
      )}

      {/* Botón de toggle para móvil - solo visible en mobile cuando está cerrado */}
      {isMobile && !isOpen && (
        <button
          aria-label="Abrir menú"
          className="fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
          onClick={() => setIsOpen(true)}
        >
          <MenuIcon className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        data-sidebar
        className={cn(
          "fixed left-0 top-0 h-full bg-white transition-all duration-300 ease-in-out",
          "shadow-xl border-r border-gray-200 overflow-hidden",
          isMobile
            ? isOpen
              ? "w-full max-w-[280px] translate-x-0 z-50"
              : "-translate-x-full z-40 w-0"
            : isOpen
              ? "w-20 translate-x-0 z-50"
              : "w-64 translate-x-0 z-50",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 border-b border-gray-200 min-h-[73px]">
            {/* En mobile siempre mostrar logo y título completo */}
            {isMobile ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <Logo size={48} />
                  <span className="font-semibold text-base text-gray-900">
                    CARVAJAL FIT
                  </span>
                </div>
                <button
                  aria-label="Cerrar menú"
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation ml-2"
                  onClick={() => setIsOpen(false)}
                >
                  <XIcon className="w-5 h-5 text-gray-600" />
                </button>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300",
                    isOpen
                      ? "opacity-0 w-0 overflow-hidden"
                      : "opacity-100 w-auto",
                  )}
                >
                  <Logo size={40} />
                  <span className="font-semibold text-md text-gray-900 whitespace-nowrap">
                    CARVAJAL FIT
                  </span>
                </div>
                <div
                  className={cn(
                    "flex justify-center w-full transition-all duration-300",
                    isOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none absolute",
                  )}
                >
                  <Logo size={48} />
                </div>
                {!isOpen && (
                  <button
                    aria-label="Colapsar menú"
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={toggleSidebar}
                  >
                    <PanelLeftClose className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={cn(sectionIndex > 0 && "mt-8")}>
                {section.title && (isMobile || !isOpen) && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <button
                          onClick={() => handleItemClick(item.path)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                            "relative group touch-manipulation",
                            isMobile && "active:bg-gray-200",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          )}
                          title={!isMobile && isOpen ? item.label : undefined}
                        >
                          <Icon
                            className={cn(
                              "flex-shrink-0 transition-colors",
                              isMobile || !isOpen ? "w-5 h-5" : "w-6 h-6 mx-auto",
                              isActive ? "text-primary" : "text-gray-600 group-hover:text-gray-900"
                            )}
                          />
                          {(isMobile || !isOpen) && (
                            <>
                              <span className="flex-1 text-left text-sm">{item.label}</span>
                              {item.badge && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full min-w-[20px] text-center">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                          {!isMobile && isOpen && isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                          )}
                          {!isMobile && isOpen && item.badge && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Profile Section */}
          <div
            ref={profileMenuRef}
            className="p-4 border-t border-gray-200 relative z-10"
          >
            {isMobile || !isOpen ? (
              <div className="relative">
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg bg-gray-50 transition-colors cursor-pointer touch-manipulation",
                    isMobile ? "active:bg-gray-200" : "hover:bg-gray-100",
                  )}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {getUserInitial()}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex-1 min-w-0 transition-all duration-300",
                      !isMobile && isOpen
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100 w-auto",
                    )}
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate whitespace-nowrap">
                      {getUserName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate whitespace-nowrap">
                      {getUserRole()}
                    </p>
                  </div>
                  {!isMobile && (
                    <button
                      className={cn(
                        "p-1 hover:bg-gray-200 rounded transition-all duration-300 flex-shrink-0",
                        isOpen
                          ? "opacity-0 w-0 overflow-hidden"
                          : "opacity-100 w-auto",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileMenuOpen(!isProfileMenuOpen);
                      }}
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                      onClick={() => {
                        router.push("/admin/settings");
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <UserIcon className="w-4 h-4 text-gray-600" />
                      <span>Mi Perfil</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                      onClick={() => {
                        router.push("/admin/settings");
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span>Configuración</span>
                    </button>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors touch-manipulation"
                      onClick={() => {
                        handleLogout();
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div
                  ref={avatarRef}
                  className="flex justify-center cursor-pointer"
                  onClick={(e) => {
                    const menuWidth = 200; // Ancho del menú
                    const menuHeight = 250; // Altura aproximada del menú
                    const padding = 8; // Padding mínimo desde los bordes

                    // Calcular posición ajustada para no salirse de la pantalla
                    let left = e.clientX;
                    let top = e.clientY;

                    // Ajustar horizontalmente si se sale por la derecha
                    if (left + menuWidth + padding > window.innerWidth) {
                      left = window.innerWidth - menuWidth - padding;
                    }
                    // Ajustar horizontalmente si se sale por la izquierda
                    if (left < padding) {
                      left = padding;
                    }

                    // Ajustar verticalmente si se sale por abajo
                    if (top + menuHeight / 2 + padding > window.innerHeight) {
                      top = window.innerHeight - menuHeight / 2 - padding;
                    }
                    // Ajustar verticalmente si se sale por arriba
                    if (top - menuHeight / 2 < padding) {
                      top = menuHeight / 2 + padding;
                    }

                    setMenuPosition({
                      top: top,
                      left: left,
                    });
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                    title={`${getUserName()} - ${getUserRole()}`}
                  >
                    <span className="text-primary font-semibold text-sm">
                      {getUserInitial()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Dropdown Menu para colapsado - Renderizado con Portal fuera del sidebar */}
      {isProfileMenuOpen &&
        mounted &&
        !isMobile &&
        isOpen &&
        (createPortal(
          <>
            {/* Overlay para cerrar el menú */}
            <div
              className="fixed inset-0 z-[90]"
              style={{ pointerEvents: "auto" }}
              onClick={() => setIsProfileMenuOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsProfileMenuOpen(false);
                }
              }}
              role="button"
              tabIndex={0}
            />
            <div
              className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] min-w-[200px] transition-opacity duration-200"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                transform: "translateY(-50%)",
                pointerEvents: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsProfileMenuOpen(false);
                }
              }}
              role="dialog"
              tabIndex={-1}
            >
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  {getUserName()}
                </p>
                <p className="text-xs text-gray-500">{getUserRole()}</p>
              </div>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  router.push("/admin/settings");
                  setIsProfileMenuOpen(false);
                }}
              >
                <UserIcon className="w-4 h-4 text-gray-600" />
                <span>Mi Perfil</span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  router.push("/admin/settings");
                  setIsProfileMenuOpen(false);
                }}
              >
                <Settings className="w-4 h-4 text-gray-600" />
                <span>Configuración</span>
              </button>
              <div className="border-t border-gray-200 my-1" />
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer relative z-[10000]"
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Botón cerrar sesión clickeado");
                  setIsProfileMenuOpen(false);
                  // Pequeño delay para asegurar que el menú se cierre antes del logout
                  setTimeout(async () => {
                    await handleLogout();
                  }, 100);
                }}
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </>,
          document.body,
        ) as React.ReactNode)}

      {/* Botón para colapsar/expandir sidebar en desktop */}
      {!isMobile && (
        <button
          aria-label={isOpen ? "Colapsar menú" : "Expandir menú"}
          className={cn(
            "fixed top-7.5 z-40 p-2 bg-white rounded-lg ",
            "border border-gray-200 hover:border-gray-300 transition-colors",
            "hover:bg-gray-50",
            isOpen ? "left-20" : "left-4",
          )}
          onClick={toggleSidebar}
        >
          {isOpen ? (
            <PanelLeftClose className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}
    </>
  );
}
