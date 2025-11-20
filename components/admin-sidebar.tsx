"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { Logo } from "./icons";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PanelLeftClose, LogOut, Settings, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Iconos SVG simples para el sidebar
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const BarChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
      { label: "Calendario", icon: CalendarIcon, path: "/admin/calendar" },
      { label: "Reportes", icon: BarChartIcon, path: "/admin/reports" },
      { label: "Miembros", icon: UsersIcon, path: "/admin/members" },
    ],
  },
  {
    title: "CONFIGURACIÓN",
    items: [
      { label: "Notificaciones", icon: BellIcon, path: "/admin/notifications", badge: 6 },
      { label: "Mensajes", icon: MessageIcon, path: "/admin/messages", badge: 3 },
      { label: "Ajustes", icon: SettingsIcon, path: "/admin/settings" },
    ],
  },
];

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
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
        />
      )}

      {/* Botón de toggle para móvil - solo visible en mobile cuando está cerrado */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
          aria-label="Abrir menú"
        >
          <MenuIcon className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        data-sidebar
        className={cn(
          "fixed left-0 top-0 h-full bg-white transition-all duration-300 ease-in-out",
          "shadow-xl border-r border-gray-200",
          isMobile
            ? isOpen
              ? "w-full max-w-[280px] translate-x-0 z-50"
              : "-translate-x-full z-40 w-0"
            : isOpen
            ? "w-20 translate-x-0 z-50"
            : "w-64 translate-x-0 z-50"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 min-h-[73px]">
            {/* En mobile siempre mostrar logo y título completo */}
            {isMobile ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <Logo size={48} />
                  <span className="font-semibold text-base text-gray-900">CARVAJAL FIT</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation ml-2"
                  aria-label="Cerrar menú"
                >
                  <XIcon className="w-5 h-5 text-gray-600" />
                </button>
              </>
            ) : (
              <>
                {!isOpen && (
                  <div className="flex items-center gap-2">
                    <Logo size={40} />
                    <span className="font-semibold text-md text-gray-900">CARVAJAL FIT</span>
                  </div>
                )}
                {isOpen && (
                  <div className="flex justify-center w-full">
                    <Logo size={48} />
                  </div>
                )}
                {!isOpen && (
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Colapsar menú"
                  >
                    <PanelLeftClose className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
            {/* {menuSections.map((section, sectionIndex) => (
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
            ))} */}
          </nav>

          {/* Profile Section */}
          <div className="p-4 border-t border-gray-200 relative" ref={profileMenuRef}>
            {isMobile || !isOpen ? (
              <div className="relative">
                <div
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg bg-gray-50 transition-colors cursor-pointer touch-manipulation",
                    isMobile ? "active:bg-gray-200" : "hover:bg-gray-100"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">A</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
                    <p className="text-xs text-gray-500 truncate">Administrador</p>
                  </div>
                  {!isMobile && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileMenuOpen(!isProfileMenuOpen);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]">
                    <button
                      onClick={() => {
                        router.push("/admin/settings");
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                    >
                      <UserIcon className="w-4 h-4 text-gray-600" />
                      <span>Mi Perfil</span>
                    </button>
                    <button
                      onClick={() => {
                        router.push("/admin/settings");
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span>Configuración</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors touch-manipulation"
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
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex justify-center cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors" title="Admin - Administrador">
                    <span className="text-primary font-semibold text-sm">A</span>
                  </div>
                </div>
                
                {/* Dropdown Menu para colapsado */}
                {isProfileMenuOpen && (
                  <div className="absolute bottom-full left-full ml-2 mb-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60] min-w-[200px]">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">Admin</p>
                      <p className="text-xs text-gray-500">Administrador</p>
                    </div>
                    <button
                      onClick={() => {
                        router.push("/admin/settings");
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-gray-600" />
                      <span>Mi Perfil</span>
                    </button>
                    <button
                      onClick={() => {
                        router.push("/admin/settings");
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span>Configuración</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Botón para expandir cuando está colapsado en desktop */}
      {isOpen && !isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-20 z-40 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors border border-gray-200"
          aria-label="Expandir menú"
        >
          <MenuIcon className="w-5 h-5 text-gray-700" />
        </button>
      )}
      
    </>
  );
}

