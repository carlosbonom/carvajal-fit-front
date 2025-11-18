"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/hero-section";
import { MembershipCard } from "@/components/membership-card";
import { MembershipCardv2 } from "@/components/MemberShip-card-v2";
import { SuccessStories } from "@/components/Success-stories";
import { Teachers } from "@/components/Teachers";

// Componente wrapper para animaciones con scroll
function AnimatedSection({ 
  children, 
  id,
  delay = 0 
}: { 
  children: React.ReactNode; 
  id?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, // La animación solo ocurre una vez
    amount: 0.2  // Se activa cuando el 20% del elemento es visible
  });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.7,
          delay: delay,
          ease: [0.25, 0.46, 0.45, 0.94] // Curva de animación suave
        }
      } : {}}
    >
      {children}
    </motion.section>
  );
}

// Componente para el hero (sin animación de entrada)
function HeroWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      id="inicio"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  return (
    <>
      <HeroWrapper>
        <HeroSection />
      </HeroWrapper>

      <AnimatedSection>
        <SuccessStories />
      </AnimatedSection>

      <section id="el-club">
        {/* <MembershipCard /> */}
        <MembershipCardv2 />
      </section>

      <AnimatedSection id="coaches" delay={0.1}>
        <Teachers />
      </AnimatedSection>

      <AnimatedSection id="faq" delay={0.1}>
        <Faq />
      </AnimatedSection>

      
        <Footer />
      
    </>
  );
}
