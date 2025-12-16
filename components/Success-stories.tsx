"use client";

import { useEffect, useRef, useState } from "react";
import { getActiveSuccessStories, SuccessStory } from "@/services/success-stories";

export const SuccessStories = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAmountRef = useRef(0);
  const isPausedRef = useRef(false);
  const isUserInteractingRef = useRef(false);
  const userScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        const response = await getActiveSuccessStories();
        setSuccessStories(response.stories);
      } catch (error) {
        console.error("Error al cargar casos de éxito:", error);
        // Si hay error, usar array vacío
        setSuccessStories([]);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;

    if (!scrollContainer || successStories.length === 0) return;

    const scrollSpeed = 1;
    const PAUSE_DURATION = 1000;

    const resumeAutoScroll = () => {
      isPausedRef.current = false;
      isUserInteractingRef.current = false;
      scrollAmountRef.current = scrollContainer.scrollLeft;
    };

    const pauseAutoScroll = () => {
      isPausedRef.current = true;
      isUserInteractingRef.current = true;
      scrollAmountRef.current = scrollContainer.scrollLeft;

      if (userScrollTimeoutRef.current)
        clearTimeout(userScrollTimeoutRef.current);

      userScrollTimeoutRef.current = setTimeout(() => {
        resumeAutoScroll();
      }, PAUSE_DURATION);
    };

    const handleUserInteraction = () => {
      pauseAutoScroll();
    };

    const handleInfiniteScroll = () => {
      const scrollWidth = scrollContainer.scrollWidth;
      const singleWidth = scrollWidth / 3;
      const scrollLeft = scrollContainer.scrollLeft;

      // Si el usuario llega demasiado al inicio
      if (scrollLeft < singleWidth * 0.5) {
        scrollContainer.scrollLeft += singleWidth;
        scrollAmountRef.current += singleWidth;
      }
      // Si el usuario llega demasiado al final
      else if (scrollLeft > singleWidth * 1.5) {
        scrollContainer.scrollLeft -= singleWidth;
        scrollAmountRef.current -= singleWidth;
      }
    };

    const handleScroll = () => {
      handleInfiniteScroll();

      if (isUserInteractingRef.current) {
        scrollAmountRef.current = scrollContainer.scrollLeft;
        if (userScrollTimeoutRef.current)
          clearTimeout(userScrollTimeoutRef.current);
        userScrollTimeoutRef.current = setTimeout(() => {
          resumeAutoScroll();
        }, PAUSE_DURATION);
      }
    };

    const handleWheel = handleUserInteraction;
    const handleTouchStart = handleUserInteraction;
    const handleTouchMove = handleUserInteraction;

    let isDragging = false;
    let startX = 0;
    let scrollLeftStart = 0;

    const handleMouseDown = (e: MouseEvent) => {
      handleUserInteraction();
      isDragging = true;
      startX = e.clientX;
      scrollLeftStart = scrollContainer.scrollLeft;
      scrollContainer.style.cursor = "grabbing";
      scrollContainer.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.clientX;
      const walk = (x - startX) * 2;

      scrollContainer.scrollLeft = scrollLeftStart - walk;
      handleUserInteraction();
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        scrollContainer.style.cursor = "grab";
        scrollContainer.style.userSelect = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    };

    const handleMouseLeave = () => {
      if (isDragging) {
        isDragging = false;
        scrollContainer.style.cursor = "grab";
        scrollContainer.style.userSelect = "";
      }
    };

    const handleMouseEnter = () => {
      scrollContainer.style.cursor = "grab";
    };

    const autoScroll = () => {
      if (!isPausedRef.current && !isUserInteractingRef.current) {
        scrollAmountRef.current += scrollSpeed;
        scrollContainer.scrollLeft = scrollAmountRef.current;
        handleInfiniteScroll();
      }
    };

    const intervalId = setInterval(autoScroll, 20);

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    scrollContainer.addEventListener("wheel", handleWheel, { passive: true });
    scrollContainer.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    scrollContainer.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    scrollContainer.addEventListener("mousedown", handleMouseDown);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);
    scrollContainer.addEventListener("mouseenter", handleMouseEnter);

    // Centrar el scroll en el segundo bloque (para scroll infinito en ambas direcciones)
    requestAnimationFrame(() => {
      const middle = scrollContainer.scrollWidth / 3;

      scrollContainer.scrollLeft = middle;
      scrollAmountRef.current = middle;
    });

    return () => {
      clearInterval(intervalId);
      if (userScrollTimeoutRef.current)
        clearTimeout(userScrollTimeoutRef.current);
      scrollContainer.removeEventListener("scroll", handleScroll);
      scrollContainer.removeEventListener("wheel", handleWheel);
      scrollContainer.removeEventListener("touchstart", handleTouchStart);
      scrollContainer.removeEventListener("touchmove", handleTouchMove);
      scrollContainer.removeEventListener("mousedown", handleMouseDown);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [successStories]);

  // No mostrar la sección si está cargando o no hay casos de éxito
  if (loading) {
    return null;
  }

  if (successStories.length === 0) {
    return null;
  }

  return (
    <div className="text-white items-center justify-center pt-16 pb-16">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">
        Casos de éxito
      </h2>
      <p className="text-sm md:text-lg lg:text-xl text-gray-400 text-center mt-4">
        Transformaciones reales del club
      </p>

      <section
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto mt-12 scrollbar-hide select-none"
        style={{
          scrollBehavior: "auto",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        {[...successStories, ...successStories, ...successStories].map(
          (story, index) => (
            <div
              key={`${story.id}-${index}`}
              className="flex-shrink-0 w-[200px] md:w-[230px] group"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg">
                <img
                  alt={story.name}
                  className="w-full h-full object-cover"
                  src={story.imageUrl || "/placeholder.svg"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-6 text-white">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold mb-1">
                    {story.name}
                  </h3>
                  {story.description && (
                    <p className="text-primary text-xs md:text-sm lg:text-base font-semibold">
                      {story.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ),
        )}
      </section>
    </div>
  );
};
