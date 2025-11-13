import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen w-screen">
      {children}
    </main>
  )
}