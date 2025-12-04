"use client";

import { useEffect, useState } from "react";
import { Lock, Calendar, Video, BookOpen, CheckCircle, Edit } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";

interface UnlockRule {
  id: string;
  courseId: string;
  courseName: string;
  weekNumber: number;
  videoIds: string[];
  videoCount: number;
  description?: string;
}

interface UnlockSchedule {
  courseId: string;
  courseName: string;
  rules: UnlockRule[];
}

export default function UnlocksPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [schedules, setSchedules] = useState<UnlockSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadUnlockSchedules();
  }, []);

  const loadUnlockSchedules = async () => {
    try {
      setLoading(true);
      // Aquí harías la llamada a la API
      // const response = await getUnlockSchedules();
      // setSchedules(response.schedules);
      
      // Datos de ejemplo
      setSchedules([
        {
          courseId: "1",
          courseName: "Quemar Grasa",
          rules: [
            {
              id: "1",
              courseId: "1",
              courseName: "Quemar Grasa",
              weekNumber: 1,
              videoIds: ["1", "2"],
              videoCount: 2,
              description: "Videos de introducción y fundamentos",
            },
            {
              id: "2",
              courseId: "1",
              courseName: "Quemar Grasa",
              weekNumber: 2,
              videoIds: ["3", "4"],
              videoCount: 2,
              description: "Aumento de intensidad",
            },
            {
              id: "3",
              courseId: "1",
              courseName: "Quemar Grasa",
              weekNumber: 3,
              videoIds: ["5"],
              videoCount: 1,
              description: "Alta intensidad",
            },
          ],
        },
        {
          courseId: "2",
          courseName: "Musculatura",
          rules: [
            {
              id: "4",
              courseId: "2",
              courseName: "Musculatura",
              weekNumber: 1,
              videoIds: ["6", "7"],
              videoCount: 2,
              description: "Fundamentos de fuerza",
            },
            {
              id: "5",
              courseId: "2",
              courseName: "Musculatura",
              weekNumber: 2,
              videoIds: ["8"],
              videoCount: 1,
              description: "Desarrollo muscular",
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Error al cargar desbloqueos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuración de Desbloqueos
            </h1>
            <p className="text-gray-600">
              Configura cuándo se desbloquean los videos según la semana de suscripción del miembro
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando configuración...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.map((schedule) => (
                <div key={schedule.courseId} className="bg-white rounded-lg shadow p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      {schedule.courseName}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {schedule.rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                  Semana {rule.weekNumber}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Video className="w-4 h-4" />
                                <span>{rule.videoCount} video{rule.videoCount !== 1 ? "s" : ""}</span>
                              </div>
                            </div>
                            
                            {rule.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {rule.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Se desbloquea automáticamente cuando el miembro completa{" "}
                                {rule.weekNumber === 1
                                  ? "la primera semana"
                                  : `${rule.weekNumber} semanas`}{" "}
                                de suscripción
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar regla"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button className="text-sm text-primary hover:text-primary/80 font-medium">
                      + Agregar nueva regla de desbloqueo
                    </button>
                  </div>
                </div>
              ))}

              {schedules.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg mb-2">
                    No hay reglas de desbloqueo configuradas
                  </p>
                  <p className="text-gray-400 text-sm">
                    Configura las reglas para cada curso
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ¿Cómo funcionan los desbloqueos?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Los videos se desbloquean automáticamente según la semana de suscripción del miembro
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  La semana 1 se cuenta desde la fecha de inicio de la suscripción
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Los miembros pueden ver todos los videos desbloqueados hasta su semana actual
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

