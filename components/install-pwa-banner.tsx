"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWABanner() {
  const pathname = usePathname();
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Solo mostrar en /club
  const isClubPage = pathname?.startsWith("/club");

  useEffect(() => {
    // Verificar si es iOS
    const checkIsIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIsIOS);

    // Verificar si la app ya está instalada
    const checkIfInstalled = () => {
      // En móviles, verificar si está en modo standalone
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      // O si está en la pantalla de inicio (iOS)
      const isIOSStandalone = (window.navigator as any).standalone === true;

      if (isStandalone || isIOSStandalone) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkIfInstalled()) {
      return;
    }

    // Verificar si el usuario ya rechazó la instalación
    const dismissedInstall = localStorage.getItem("pwa-install-dismissed");
    if (dismissedInstall) {
      return;
    }

    // Escuchar el evento beforeinstallprompt (solo en navegadores compatibles)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar el banner solo en /club
      if (isClubPage) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Si es iOS y estamos en /club, mostrar el banner directamente
    if (isClubPage && (deferredPrompt || checkIsIOS) && !checkIfInstalled()) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isClubPage, deferredPrompt]);

  // Mostrar/ocultar banner cuando cambia la ruta
  useEffect(() => {
    // Mostrar si: 
    // 1. Estamos en /club
    // 2. No está instalada
    // 3. (Hay prompt diferido O es iOS)
    if (isClubPage && !isInstalled && (deferredPrompt || isIOS)) {
      const dismissedInstall = localStorage.getItem("pwa-install-dismissed");
      if (!dismissedInstall) {
        setShowBanner(true);
      }
    } else {
      setShowBanner(false);
    }
  }, [pathname, deferredPrompt, isInstalled, isClubPage, isIOS]);

  const handleInstallClick = async () => {
    // Si es iOS, mostrar instrucciones
    if (isIOS) {
      alert(
        "Para instalar la app en iPhone/iPad:\n\n" +
        "1. Toca el botón de compartir (cuadrado con flecha) en la barra inferior\n" +
        "2. Desliza hacia abajo y selecciona 'Agregar a Inicio'\n" +
        "3. Toca 'Agregar' arriba a la derecha"
      );
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    try {
      // Mostrar el prompt de instalación
      await deferredPrompt.prompt();

      // Esperar a que el usuario responda
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("Usuario aceptó instalar la app");
        setShowBanner(false);
        setIsInstalled(true);
      } else {
        console.log("Usuario rechazó instalar la app");
      }

      // Limpiar el prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error al mostrar el prompt de instalación:", error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showBanner || !isClubPage || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-br from-[#00b2de] to-[#0099c7] rounded-xl shadow-2xl border border-[#00b2de]/50 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm md:text-base mb-1">
              Instalar en tu celular
            </h3>
            <p className="text-white/90 text-xs md:text-sm mb-3">
              {isIOS
                ? "Agrega la app a tu pantalla de inicio para una mejor experiencia"
                : "Instala la app para acceder más rápido y disfrutar de una mejor experiencia"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#00b2de] rounded-lg font-medium text-sm hover:bg-white/90 transition-colors shadow-lg"
              >
                <Download className="w-4 h-4" />
                {isIOS ? "Ver cómo instalar" : "Instalar"}
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





