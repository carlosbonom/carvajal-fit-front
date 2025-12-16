"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { clearUser, setUser } from "@/lib/store/slices/userSlice";
import { clearTokens, getAccessToken } from "@/lib/auth-utils";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logout, getProfile } from "@/services/auth";
import { store } from "@/lib/store/store";

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Cargar usuario desde token si existe
  useEffect(() => {
    const loadUserFromToken = async () => {
      // Verificar si ya hay usuario en Redux
      const currentState = store.getState();

      if (currentState.user.user) {
        console.log("Usuario ya existe en Redux:", currentState.user.user);

        return;
      }

      const token = getAccessToken();

      if (!token) {
        console.log("No hay token en localStorage");

        return;
      }

      try {
        console.log("Cargando usuario desde token...");
        const userProfile = await getProfile(token);

        console.log("Usuario cargado:", userProfile);
        dispatch(setUser(userProfile));
      } catch (error) {
        // Si el token es inválido, limpiar tokens
        console.error("Error al cargar usuario:", error);
        clearTokens();
      }
    };

    loadUserFromToken();
  }, []);

  // Obtener conteo del carrito cuando estamos en rutas de market
  useEffect(() => {
    const updateCartCount = () => {
      if (pathname?.startsWith("/market/jose")) {
        const cart = localStorage.getItem("cart_jose");
        if (cart) {
          try {
            const items = JSON.parse(cart);
            const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
            setCartItemCount(count);
          } catch {
            setCartItemCount(0);
          }
        } else {
          setCartItemCount(0);
        }
      } else if (pathname?.startsWith("/market/gabriel")) {
        const cart = localStorage.getItem("cart_gabriel");
        if (cart) {
          try {
            const items = JSON.parse(cart);
            const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
            setCartItemCount(count);
          } catch {
            setCartItemCount(0);
          }
        } else {
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    updateCartCount();
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Polling para detectar cambios en el mismo tab (localStorage no dispara eventos en el mismo tab)
    const interval = setInterval(updateCartCount, 500);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [pathname]);

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

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      // Cerrar el menú móvil después de hacer clic
      setIsMenuOpen(false);
    }
  };

  const handleGoToClub = () => {
    if (!user) return;

    // Si es admin, ir al admin
    if (user.role === "admin") {
      router.push("/admin");

      return;
    }

    // Verificar si tiene subscription
    if (!user.subscription) {
      // Si no tiene subscription, redirigir al checkout
      router.push("/checkout");
    } else {
      // Si tiene subscription, redirigir al club
      router.push("/club");
    }
  };

  return (
    <HeroUINavbar
      className="bg-black/90 backdrop-blur-xl backdrop-saturate-150"
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      position="sticky"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo size={55} />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex items-center justify-center gap-4">
          <ul className="hidden lg:flex gap-4 justify-start ml-2">
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href}>
                <a
                  className={
                    " text-white cursor-pointer " +
                    clsx(
                      linkStyles({ color: "foreground" }),
                      "data-[active=true]:text-primary data-[active=true]:font-medium",
                    )
                  }
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                >
                  {item.label}
                </a>
              </NavbarItem>
            ))}
          </ul>
          {/* Carrito para rutas de market */}
          {(pathname?.startsWith("/market/jose") || pathname?.startsWith("/market/gabriel")) && cartItemCount > 0 && (
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              className="relative"
              onClick={() => {
                if (pathname?.startsWith("/market/jose")) {
                  router.push("/market/jose/checkout");
                } else if (pathname?.startsWith("/market/gabriel")) {
                  router.push("/market/gabriel/checkout");
                }
              }}
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            </Button>
          )}
          {user ? (
            <Button
              color="primary"
              size="sm"
              variant="solid"
              onClick={handleGoToClub}
            >
              {user.role === "admin" ? "Ir a admin" : "Ir al club"}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                className="border-[#00b2de] text-[#00b2de] hover:bg-[#00b2de]/10"
                color="primary"
                size="sm"
                variant="bordered"
                onClick={() => router.push("/login")}
              >
                Iniciar sesión
              </Button>
              <Button
                color="primary"
                size="sm"
                variant="solid"
                onClick={() => router.push("/signup")}
              >
                Únete al club
              </Button>
            </div>
          )}
        </NavbarItem>
        {/* <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem> */}
        {/*  */}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        {/* Carrito para móvil en rutas de market */}
        {(pathname?.startsWith("/market/jose") || pathname?.startsWith("/market/gabriel")) && cartItemCount > 0 && (
          <Button
            isIconOnly
            color="primary"
            variant="flat"
            className="relative mr-2"
            onClick={() => {
              if (pathname?.startsWith("/market/jose")) {
                router.push("/market/jose/checkout");
              } else if (pathname?.startsWith("/market/gabriel")) {
                router.push("/market/gabriel/checkout");
              }
            }}
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          </Button>
        )}
        {user ? (
          <Button
            color="primary"
            size="sm"
            variant="solid"
            onClick={handleGoToClub}
          >
            {user.role === "admin" ? "Admin" : "Club"}
          </Button>
        ) : (
          <Button
            color="primary"
            size="sm"
            variant="solid"
            onClick={() => router.push("/signup")}
          >
            Únete
          </Button>
        )}
        <NavbarMenuToggle className="text-white" />
      </NavbarContent>

      <NavbarMenu className="bg-black/90 backdrop-blur-xl pt-6">
        <div className="flex flex-col items-center gap-6 py-6">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <a
                className="text-white text-2xl font-semibold hover:text-primary transition-colors cursor-pointer"
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
              >
                {item.label}
              </a>
            </NavbarMenuItem>
          ))}
          <div className="flex flex-col gap-3 w-full px-6 mt-4">
            {user ? (
              <Button
                color="primary"
                size="lg"
                variant="solid"
                onClick={() => {
                  handleGoToClub();
                  setIsMenuOpen(false);
                }}
              >
                {user.role === "admin" ? "Ir a admin" : "Ir al club"}
              </Button>
            ) : (
              <>
                <Button
                  className="border-[#00b2de] text-[#00b2de] hover:bg-[#00b2de]/10"
                  color="primary"
                  size="lg"
                  variant="bordered"
                  onClick={() => {
                    router.push("/login");
                    setIsMenuOpen(false);
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  variant="solid"
                  onClick={() => {
                    router.push("/signup");
                    setIsMenuOpen(false);
                  }}
                >
                  Únete al club
                </Button>
              </>
            )}
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
