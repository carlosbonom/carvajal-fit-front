"use client";

import { useEffect, useRef, useState } from "react";

const successStories = [{
    id: 1,
    name: "Juan Perez",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}, {
    id: 2,
    name: "Maria Gomez",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}, {
    id: 3,
    name: "Pedro Rodriguez",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}, {
    id: 4,
    name: "Ana Lopez",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}, {
    id: 5,
    name: "Luis Garcia",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}, {
    id: 6,
    name: "Carlos Hernandez",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}, {
    id: 7,
    name: "Rosa Martinez",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}, {
    id: 8,
    name: "Jorge Lopez",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}, {
    id: 9,
    name: "Ana Lopez",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}, {
    id: 10,
    name: "Luis Garcia",
    image: "https://placehold.co/280x320/gray/white?text=Imagen",
    description: "Transformación real de un miembro del club",
}]

export const SuccessStories = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPausedRef = useRef(false);
    const scrollAmountRef = useRef(0);
    const userScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isUserInteractingRef = useRef(false);
    const lastScrollTimeRef = useRef(0);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if(!scrollContainer) return;

        const scrollSpeed = 1;
        const PAUSE_DURATION = 1000; // 1 segundos de inactividad antes de reanudar

        // Función para reanudar el scroll automático
        const resumeAutoScroll = () => {
            isPausedRef.current = false;
            isUserInteractingRef.current = false;
            // Sincronizar scrollAmount con la posición actual
            scrollAmountRef.current = scrollContainer.scrollLeft;
        };

        // Función para pausar el scroll automático
        const pauseAutoScroll = () => {
            isPausedRef.current = true;
            isUserInteractingRef.current = true;
            // Sincronizar scrollAmount con la posición actual
            scrollAmountRef.current = scrollContainer.scrollLeft;
            
            // Limpiar timeout anterior
            if (userScrollTimeoutRef.current) {
                clearTimeout(userScrollTimeoutRef.current);
            }
            
            // Configurar timeout para reanudar después de la inactividad
            userScrollTimeoutRef.current = setTimeout(() => {
                resumeAutoScroll();
            }, PAUSE_DURATION);
        };

        // Detectar cualquier interacción del usuario que pueda indicar scroll manual
        const handleUserInteraction = () => {
            lastScrollTimeRef.current = Date.now();
            pauseAutoScroll();
        };

        // Detectar scroll manual - se activa cuando el usuario hace scroll
        const handleScroll = () => {
            // Si el usuario está interactuando, actualizar la posición y reiniciar el timeout
            if (isUserInteractingRef.current) {
                scrollAmountRef.current = scrollContainer.scrollLeft;
                lastScrollTimeRef.current = Date.now();
                // Reiniciar el timeout de pausa
                if (userScrollTimeoutRef.current) {
                    clearTimeout(userScrollTimeoutRef.current);
                }
                userScrollTimeoutRef.current = setTimeout(() => {
                    resumeAutoScroll();
                }, PAUSE_DURATION);
            }
        };

        // Detectar interacción con rueda del mouse
        const handleWheel = () => {
            // Pausar el auto-scroll cuando el usuario usa la rueda
            // El navegador manejará el scroll automáticamente
            handleUserInteraction();
        };

        // Detectar interacción táctil (para móviles)
        const handleTouchStart = () => {
            handleUserInteraction();
        };

        // Detectar movimiento táctil continuo
        const handleTouchMove = () => {
            handleUserInteraction();
        };

        // Soporte para arrastrar con el mouse (click y arrastrar)
        let isDragging = false;
        let startX = 0;
        let scrollLeftStart = 0;

        const handleMouseDown = (e: MouseEvent) => {
            handleUserInteraction();
            isDragging = true;
            startX = e.clientX; // Posición del mouse en el viewport
            scrollLeftStart = scrollContainer.scrollLeft;
            scrollContainer.style.cursor = 'grabbing';
            scrollContainer.style.userSelect = 'none';
            // Agregar listener de mousemove solo cuando se está arrastrando
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.clientX; // Posición actual del mouse en el viewport
            const walk = (x - startX) * 2; // Velocidad de arrastre (multiplicador para hacerlo más rápido)
            scrollContainer.scrollLeft = scrollLeftStart - walk;
            handleUserInteraction(); // Mantener pausado mientras arrastra
        };

        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                scrollContainer.style.cursor = 'grab';
                scrollContainer.style.userSelect = '';
                // Remover listeners cuando se termina el arrastre
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        };

        const handleMouseLeave = () => {
            if (isDragging) {
                isDragging = false;
                scrollContainer.style.cursor = 'grab';
                scrollContainer.style.userSelect = '';
            }
        };

        // Detectar cuando el mouse entra al contenedor
        const handleMouseEnter = () => {
            scrollContainer.style.cursor = 'grab';
        };

        // Scroll automático
        const autoScroll = () => {
            // Solo hacer scroll automático si no está pausado
            if (!isPausedRef.current && !isUserInteractingRef.current && scrollContainer) {
                lastScrollTimeRef.current = Date.now();
                scrollAmountRef.current += scrollSpeed;
                scrollContainer.scrollLeft = scrollAmountRef.current;

                if (scrollAmountRef.current >= scrollContainer.scrollWidth / 2) {
                    scrollAmountRef.current = 0;
                }
            }
        };

        // Event listeners
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        scrollContainer.addEventListener('wheel', handleWheel, { passive: true });
        scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
        scrollContainer.addEventListener('mousedown', handleMouseDown);
        scrollContainer.addEventListener('mouseleave', handleMouseLeave);
        scrollContainer.addEventListener('mouseenter', handleMouseEnter);

        const intervalId = setInterval(autoScroll, 20);

        // Inicializar scrollAmount con la posición actual
        scrollAmountRef.current = scrollContainer.scrollLeft;
        lastScrollTimeRef.current = Date.now();

        return () => {
            clearInterval(intervalId);
            if (userScrollTimeoutRef.current) {
                clearTimeout(userScrollTimeoutRef.current);
            }
            scrollContainer.removeEventListener('scroll', handleScroll);
            scrollContainer.removeEventListener('wheel', handleWheel);
            scrollContainer.removeEventListener('touchstart', handleTouchStart);
            scrollContainer.removeEventListener('touchmove', handleTouchMove);
            scrollContainer.removeEventListener('mousedown', handleMouseDown);
            scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
            scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
            // Limpiar listeners de document por si acaso
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    }, []);


    return (
        <div className="text-white   items-center justify-center pt-16 pb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">Casos de éxito</h2>
            <p className="text-lg md:text-lg lg:text-xl text-gray-400 text-center mt-4">Transformaciones reales de nuestros miembros del club</p>
            <section ref={scrollRef} className="flex gap-6 overflow-x-auto mt-12 scrollbar-hide select-none" style={{ scrollBehavior: "auto" }}>
                
                    {successStories.map((story, index) => (
                        <div key={story.id} className="flex-shrink-0 w-[280px] md:w-[320px] group">
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg">
                                <img src={story.image || "/placeholder.svg"} alt={story.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h3 className="text-xl font-bold mb-1">{story.name}</h3>
                                    <p className="text-primary font-semibold">{story.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                
            </section>
        </div>
    )
}