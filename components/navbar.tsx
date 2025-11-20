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
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";
import { useProfile } from "@/lib/hooks/use-profile";
import { createClient } from "@/lib/supabase/client";

export const Navbar = () => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading: userLoading } = useUser();
  const { profile, loading: profileLoading } = useProfile();
  const loading = userLoading || profileLoading;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Cerrar el menú móvil después de hacer clic
      setIsMenuOpen(false);
    }
  };
  

  return (
    <HeroUINavbar 
      maxWidth="xl" 
      position="sticky"
      className="bg-black/90 backdrop-blur-xl backdrop-saturate-150"
      isMenuOpen={isMenuOpen}
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
                className={' text-white cursor-pointer ' + clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
              >
                {item.label}
              </a>
            </NavbarItem>
          ))}
          </ul>
         {loading ? (
            <div className="w-24 h-10" />
         ) : user && profile ? (
          <>
         <Button 
            onPress={() => router.push((profile?.role === 'admin' || profile?.role === 'owner') ? '/admin' : '/club')}
            variant="solid" 
            color="primary" 

          >
           {(profile?.role === 'admin' || profile?.role === 'owner') ? 'Ir a admin' : 'Ir al club'}
          </Button> 
          </>
         ) : (
            <>
              <Button variant="bordered" color="primary" onPress={() => router.push('/login')} className="border-[#00b2de] text-[#00b2de] hover:bg-[#00b2de]/10">
                Iniciar sesión
              </Button>
              <Button variant="solid" color="primary" onPress={() => router.push('/signup')}>
                Únete al club
              </Button>
            </>
         )} 
          
        </NavbarItem>
        {/* <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem> */}
  {/*  */}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        {/* <Link isExternal aria-label="Github" href={siteConfig.links.github}> */}
          <Button variant="solid" color="primary" size="sm" onClick={() => router.push('/signup')}>
            Únete
          </Button>
        {/* </Link> */}
        <NavbarMenuToggle className="text-white" />
      </NavbarContent>

      <NavbarMenu className="bg-black/90 backdrop-blur-xl pt-6">
        <div className="flex flex-col items-center gap-6 py-6">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <a
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="text-white text-2xl font-semibold hover:text-primary transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            </NavbarMenuItem>
          ))}
          <div className="flex flex-col gap-3 w-full px-6 mt-4">
            {loading ? (
              <div className="h-12" />
            ) : user ? (
              <>
                <div className="text-white text-center mb-2">
                  {profile?.display_name || profile?.name || user.email}
                </div>
                <Button 
                  variant="bordered" 
                  color="primary" 
                  size="lg"
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }} 
                  className="border-[#00b2de] text-[#00b2de] hover:bg-[#00b2de]/10"
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="bordered" 
                  color="primary" 
                  size="lg"
                  onClick={() => {
                    router.push('/login')
                    setIsMenuOpen(false)
                  }} 
                  className="border-[#00b2de] text-[#00b2de] hover:bg-[#00b2de]/10"
                >
                  Iniciar sesión
                </Button>
                <Button 
                  variant="solid" 
                  color="primary" 
                  size="lg"
                  onClick={() => {
                    router.push('/signup')
                    setIsMenuOpen(false)
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
