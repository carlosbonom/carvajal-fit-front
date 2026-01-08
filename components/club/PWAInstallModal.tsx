"use client";

import React from "react";
import { X, Share, PlusSquare, Download, Smartphone, Chrome } from "lucide-react";
import { Button } from "@heroui/react";

interface PWAInstallModalProps {
    isOpen: boolean;
    onClose: () => void;
    isIOS: boolean;
    onInstall?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
    isOpen,
    onClose,
    isIOS,
    onInstall,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#00b2de]/10 rounded-2xl flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-[#00b2de]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">Instalar Aplicación</h3>
                            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mt-1">
                                Lleva el Club Carvajal Fit a tu pantalla
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/30 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 pt-4 space-y-6">
                    {isIOS ? (
                        /* iOS / Safari Instructions */
                        <div className="space-y-6">
                            <p className="text-white/70 text-[13px] leading-relaxed">
                                Para disfrutar de una experiencia completa en tu iPhone o iPad, sigue estos pasos en <span className="text-white font-bold underline decoration-[#00b2de]">Safari</span>:
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <span className="text-white font-bold text-xs">1</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">Presiona el botón "Compartir"</p>
                                        <p className="text-white/40 text-xs mt-0.5">Es el icono del cuadrado con una flecha hacia arriba <Share className="w-3.5 h-3.5 inline text-[#00b2de] ml-1" /></p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <span className="text-white font-bold text-xs">2</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">Busca la opción "Agregar al inicio"</p>
                                        <p className="text-white/40 text-xs mt-0.5">Baja en el menú hasta encontrar <PlusSquare className="w-3.5 h-3.5 inline text-[#00b2de] ml-1" /></p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <span className="text-white font-bold text-xs">3</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">Confirma presionando "Agregar"</p>
                                        <p className="text-white/40 text-xs mt-0.5">La app aparecerá en tu menú de inicio inmediatamente.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Android / Chrome Instructions */
                        <div className="space-y-6 text-center py-4">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 border border-white/5">
                                <Chrome className="w-10 h-10 text-[#00b2de]" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-white/70 text-[14px] leading-relaxed max-w-[280px] mx-auto">
                                    Instala la aplicación para acceder más rápido, recibir notificaciones y tener una mejor experiencia de navegación.
                                </p>
                                <div className="pt-4">
                                    <Button
                                        size="lg"
                                        className="w-full h-14 rounded-2xl bg-[#00b2de] text-white font-bold text-base shadow-lg shadow-[#00b2de]/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        onClick={onInstall}
                                        startContent={<Download className="w-5 h-5" />}
                                    >
                                        Instalar Ahora
                                    </Button>
                                </div>
                                <p className="text-white/30 text-[11px] font-medium pt-2">
                                    Si no aparece el instalador, busca "Instalar aplicación" en el menú de opciones <span className="font-bold">⋮</span> de tu navegador.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 border-t border-white/5 text-center">
                        <button
                            onClick={onClose}
                            className="text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-widest py-2 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
