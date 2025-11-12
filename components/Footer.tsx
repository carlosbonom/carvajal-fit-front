'use-client'
import { Instagram, Youtube } from "lucide-react";
import { Logo } from "./icons";
import Link from "next/link";

export function Footer(){
    return(
        <footer className="bg-black text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto  px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Logo & Description */}
            <div className="space-y-4">
              <Logo size={110} />
              <p className="text-sm text-primary-foreground/80 leading-relaxed">
                Transforma tu cuerpo y mentalidad con el Club Carvajal Fit. Entrenamiento profesional con 11 años de
                experiencia.
              </p>
            </div>
  
            {/* Gabriel's Social Media */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Gabriel Carvajal</h3>
              <div className="flex flex-col gap-3">
                <Link
                  href="https://www.tiktok.com/@gabriel__fit"
                  target="_blank"
                  className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  TikTok
                </Link>
                <Link
                  href="https://www.instagram.com/gabriel_carvajal"
                  target="_blank"
                  className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </Link>
                <Link
                  href="https://www.youtube.com/@GabrielFit-nr1qp"
                  target="_blank"
                  className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                  YouTube
                </Link>
              </div>
            </div>
  
            {/* José's Social Media */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">José Carvajal</h3>
              <div className="flex flex-col gap-3">
                {/* <Link
                  href="https://www.tiktok.com/@josecarvajal"
                  target="_blank"
                  className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  TikTok
                </Link> */}
                <Link
                  href="https://www.instagram.com/jose___carvajal/"
                  target="_blank"
                  className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </Link>
                <Link
                  href="https://www.youtube.com/@glucofitness"
                  target="_blank"
                  className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                  YouTube
                </Link>
              </div>
            </div>
          </div>
  
          <div className="border-t border-primary-foreground/20 pt-8 text-center">
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Club Carvajal Fit.
            </p>
          </div>
        </div>
      </footer>
    )
}