"use client"

import { useState, useRef, useEffect } from "react"
import { Dumbbell, Play, Pause } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"



export function HeroSection() {
  const router = useRouter()

  const [isHovered, setIsHovered] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)

  const [currentTime, setCurrentTime] = useState(0)

  const [duration, setDuration] = useState(0)

  const [isDragging, setIsDragging] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  const hasInteracted = useRef(false)



  const playVideo = async () => {

    if (videoRef.current) {

      try {

        await videoRef.current.play()

        setIsPlaying(true)

        hasInteracted.current = true

      } catch (error) {

        console.log("Error al reproducir video:", error)

        setIsPlaying(false)

      }

    }

  }



  const togglePlay = async () => {

    if (videoRef.current) {

      if (isPlaying) {

        videoRef.current.pause()

        setIsPlaying(false)

      } else {

        await playVideo()

      }

    }

  }



  const handleTimeUpdate = () => {

    if (videoRef.current && !isDragging) {

      setCurrentTime(videoRef.current.currentTime)

    }

  }



  const handleLoadedMetadata = () => {

    if (videoRef.current) {

      setDuration(videoRef.current.duration)

    }

  }



  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (videoRef.current) {

      const newTime = parseFloat(e.target.value)

      videoRef.current.currentTime = newTime

      setCurrentTime(newTime)

    }

  }



  const handleSeekStart = () => {

    setIsDragging(true)

  }



  const handleSeekEnd = () => {

    setIsDragging(false)

  }



  useEffect(() => {

    const video = videoRef.current

    if (video) {

      video.addEventListener("timeupdate", handleTimeUpdate)

      video.addEventListener("loadedmetadata", handleLoadedMetadata)

      // Intentar reproducir automáticamente cuando el video esté listo

      const tryAutoPlay = async () => {

        try {

          await video.play()

          setIsPlaying(true)

          hasInteracted.current = true

        } catch (error) {

          // Si falla el autoplay, intentar cuando el usuario interactúe

          const handleUserInteraction = async () => {

            if (!hasInteracted.current && videoRef.current) {

              try {

                await videoRef.current.play()

                setIsPlaying(true)

                hasInteracted.current = true

              } catch (err) {

                console.log("Error al reproducir video:", err)

              }

            }

          }

          document.addEventListener("click", handleUserInteraction, { once: true })

          document.addEventListener("touchstart", handleUserInteraction, { once: true })

          document.addEventListener("keydown", handleUserInteraction, { once: true })

        }

      }

      if (video.readyState >= 2) {

        // El video ya tiene metadata cargada

        tryAutoPlay()

      } else {

        // Esperar a que el video esté listo

        video.addEventListener("loadeddata", tryAutoPlay, { once: true })

      }

      return () => {

        video.removeEventListener("timeupdate", handleTimeUpdate)

        video.removeEventListener("loadedmetadata", handleLoadedMetadata)

      }

    }

  }, [])



  return (

    <section id="inicio" className="bg-black text-white pt-16 pb-16 md:pb-24">

      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Content */}

          <div className="space-y-8">

            {/* Chip */}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00b2de]/10 border border-[#00b2de]/20">

              <Dumbbell className="w-4 h-4 text-[#00b2de]" />

              <span className="text-sm font-medium text-[#00b2de]">Club Carvajal Fit</span>

            </div>



            {/* Heading */}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">

              Tu cambio comienza aquí

            </h1>



            {/* Subheading */}

            <p className="text-lg md:text-xl text-gray-400 leading-relaxed text-pretty">

              "Todos los que pertenecen al Club tienen un gran físico y una gran mentalidad, sino... acá la obtienen."

            </p>



            {/* CTA Button */}

            <Button

              size="lg"

              className="bg-[#00b2de] hover:bg-[#00b2de]/90 text-white font-semibold text-lg px-8 py-6 rounded-lg"
              onClick={() => router.push('/signup')}
            >

              Únete al Club

            </Button>

          </div>



          {/* Right Content - Video */}

          <div

            className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl group"

            onMouseEnter={() => setIsHovered(true)}

            onMouseLeave={() => setIsHovered(false)}

          >

            <video

              ref={videoRef}

              className="w-full h-full object-cover"

              autoPlay

              loop

              playsInline

              onPlay={() => setIsPlaying(true)}

              onPause={() => setIsPlaying(false)}

              onTimeUpdate={handleTimeUpdate}

              onLoadedMetadata={handleLoadedMetadata}

            >

              <source

                src="https://melli.fydeli.com/carvajal-fit/club%20vienvenida.webm"

                type="video/webm"

              />

              <source

                src="https://melli.fydeli.com/carvajal-fit/club-bienvenida.mp4"

                type="video/mp4"

              />

              Tu navegador no soporta la reproducción de video.

            </video>



            {/* Video Controls - Only visible on hover */}

            <div

              className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${

                isHovered ? "opacity-100" : "opacity-0"

              }`}

            >

              {/* Play/Pause Button - Centered */}

              <div className="flex items-center justify-center flex-1 pointer-events-none">

                <button

                  onClick={togglePlay}

                  className="p-4 rounded-full bg-[#00b2de]/60 backdrop-blur-sm hover:bg-[#00b2de]/80 transition-all shadow-2xl hover:scale-110 pointer-events-auto"

                  aria-label={isPlaying ? "Pausar" : "Reproducir"}

                >

                  {isPlaying ? (

                    <Pause className="w-8 h-8 text-white" />

                  ) : (

                    <Play className="w-8 h-8 text-white ml-1" />

                  )}

                </button>

              </div>



              {/* Progress Slider - Bottom */}

              <div className="w-full px-4 pb-4 pointer-events-auto">

                <input

                  type="range"

                  min="0"

                  max={duration || 0}

                  step="0.1"

                  value={currentTime}

                  onChange={handleSeek}

                  onMouseDown={handleSeekStart}

                  onMouseUp={handleSeekEnd}

                  onTouchStart={handleSeekStart}

                  onTouchEnd={handleSeekEnd}

                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"

                  style={{

                    background: `linear-gradient(to right, #00b2de 0%, #00b2de ${

                      duration ? (currentTime / duration) * 100 : 0

                    }%, #4b5563 ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 100%)`,

                  }}

                />

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  )

}

