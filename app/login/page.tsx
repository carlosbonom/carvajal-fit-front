"use client";

import { Suspense } from "react";

import Login from "@/components/login";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Cargando...
        </div>
      }
    >
      <Login />
    </Suspense>
  );
}
