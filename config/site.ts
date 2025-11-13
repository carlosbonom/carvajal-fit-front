export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Carvajal fit",
  description: "Tu salud, nuestro compromiso.",
  navItems: [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "El Club",
      href: "/el-club",
    },
    {
      label: "Planes",
      href: "/pricing",
    },
    {
      label: "Coaches",
      href: "/blog",
    },
    {
      label: "Faq",
      href: "/faq",
    },
  ],
  navMenuItems: [
    {
      label: "Inicio",
      href: "/profile",
    },
    {
      label: "El Club",
      href: "/dashboard",
    },
    {
      label: "Planes",
      href: "/planes",
    },
    {
      label: "Coaches",
      href: "/team",
    },
    {
      label: "Faq",
      href: "/faq",
    },
    {
      label: "Únete al club",
      href: "/unete-al-club",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
