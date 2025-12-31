"use client";

import { useEffect, useRef } from "react";
import { User, Lock, CreditCard, LogOut, X, BarChart2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearUser } from "@/lib/store/slices/userSlice";
import { clearTokens } from "@/lib/auth-utils";

interface UserSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    userEmail?: string;
    userImage?: string;
}

export default function UserSidebar({
    isOpen,
    onClose,
    userName,
    userEmail,
    userImage,
}: UserSidebarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node) &&
                isOpen
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // Bloquear scroll cuando está abierto
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const handleLogout = () => {
        clearTokens();
        dispatch(clearUser());
        router.push("/login");
        onClose();
    };

    const menuItems = [
        {
            icon: User,
            label: "Mi Perfil",
            description: "Datos personales",
            onClick: () => {
                router.push("/club/profile");
                onClose();
            },
        },
        {
            icon: Lock,
            label: "Seguridad",
            description: "Contraseña y acceso",
            onClick: () => {
                router.push("/club/security");
                onClose();
            },
        },
        {
            icon: CreditCard,
            label: "Suscripción",
            description: "Pagos y plan actual",
            onClick: () => {
                router.push("/club/subscription");
                onClose();
            },
        },
        {
            icon: BarChart2,
            label: "Mi Progreso",
            description: "Peso y estadísticas",
            onClick: () => {
                router.push("/club/progress");
                onClose();
            },
        },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-[#1a1a1a] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-white">Mi Cuenta</h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-white/70 hover:text-white" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#00b2de] flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0">
                                {userImage ? (
                                    <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    userName?.charAt(0).toUpperCase() || "U"
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="tex-white font-medium truncate">{userName || "Usuario"}</p>
                                <p className="text-white/50 text-sm truncate">{userEmail || ""}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="px-4 space-y-2">
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group text-left"
                                >
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#00b2de]/20 text-white/70 group-hover:text-[#00b2de] transition-colors">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{item.label}</p>
                                        <p className="text-white/40 text-xs">{item.description}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer - Logout */}
                    <div className="p-6 border-t border-white/10 bg-[#1a1a1a]">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-medium border border-red-500/20 hover:border-red-500/30"
                        >
                            <LogOut className="w-5 h-5" />
                            Cerrar Sesión
                        </button>
                    {/* <p className="text-center text-white/20 text-xs mt-4">
                        Carvajal Fit Club v1.0
                    </p> */}
                    </div>
                </div>
            </div>
        </>
    );
}
