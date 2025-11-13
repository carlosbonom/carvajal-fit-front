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

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      className="bg-transparent backdrop-blur-md backdrop-saturate-150"
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
          <Button variant="solid" color="primary">
            Únete al club
          </Button>
        </NavbarItem>
        {/* <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem> */}
  {/*  */}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        {/* <Link isExternal aria-label="Github" href={siteConfig.links.github}> */}
          <Button variant="solid" color="primary">
            Únete al club
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
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
