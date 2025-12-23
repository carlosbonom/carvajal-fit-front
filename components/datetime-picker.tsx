"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DateTimePickerProps {
  value: string; // formato: YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function DateTimePicker({
  value,
  onChange,
  label,
  placeholder = "Seleccionar fecha y hora",
  className = "",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState({ hours: 0, minutes: 0 });
  const [mode, setMode] = useState<"date" | "time">("date");
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parsear valor inicial
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setSelectedTime({ hours: date.getHours(), minutes: date.getMinutes() });
        setCurrentDate(date);
      }
    }
  }, [value]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setMode("date");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
      selectedTime.hours,
      selectedTime.minutes
    );
    setSelectedDate(newDate);
    setMode("time");
  };

  const handleTimeConfirm = () => {
    if (selectedDate) {
      const finalDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.hours,
        selectedTime.minutes
      );
      
      // Formatear como YYYY-MM-DDTHH:mm
      const year = finalDate.getFullYear();
      const month = String(finalDate.getMonth() + 1).padStart(2, "0");
      const day = String(finalDate.getDate()).padStart(2, "0");
      const hours = String(selectedTime.hours).padStart(2, "0");
      const minutes = String(selectedTime.minutes).padStart(2, "0");
      
      onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
      setIsOpen(false);
      setMode("date");
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setSelectedTime({ hours: today.getHours(), minutes: today.getMinutes() });
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return placeholder;
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    
    return date.toLocaleDateString("es-CL", options);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className={value ? "text-gray-900" : "text-gray-500"}>
              {formatDisplayValue()}
            </span>
          </div>
        </button>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setSelectedDate(null);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => {
                setIsOpen(false);
                setMode("date");
              }}
            />
            
            {/* Picker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-full max-w-sm"
            >
              {mode === "date" ? (
                <div className="space-y-4">
                  {/* Header del calendario */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 py-1"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Días del mes */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                      }

                      const isTodayDay = isToday(day);
                      const isSelectedDay = isSelected(day);

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDateSelect(day)}
                          className={`
                            aspect-square rounded-lg text-sm font-medium transition-all
                            ${isSelectedDay
                              ? "bg-primary text-white shadow-md scale-105"
                              : isTodayDay
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-gray-700 hover:bg-gray-100"
                            }
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleToday}
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selector de hora */}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-4">Seleccionar Hora</h3>
                    <div className="flex items-center justify-center gap-4">
                      {/* Horas */}
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-gray-500 mb-2">Hora</label>
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto scrollbar-hide">
                          {Array.from({ length: 24 }, (_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedTime({ ...selectedTime, hours: i })}
                              className={`
                                w-12 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                ${selectedTime.hours === i
                                  ? "bg-primary text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                                }
                              `}
                            >
                              {String(i).padStart(2, "0")}
                            </button>
                          ))}
                        </div>
                      </div>

                      <span className="text-2xl font-bold text-gray-400 mt-8">:</span>

                      {/* Minutos */}
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-gray-500 mb-2">Minutos</label>
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto scrollbar-hide">
                          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                            <button
                              key={minute}
                              type="button"
                              onClick={() => setSelectedTime({ ...selectedTime, minutes: minute })}
                              className={`
                                w-12 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                ${selectedTime.minutes === minute
                                  ? "bg-primary text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                                }
                              `}
                            >
                              {String(minute).padStart(2, "0")}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hora seleccionada */}
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                      <Clock className="w-5 h-5 text-primary" />
                      {String(selectedTime.hours).padStart(2, "0")}:
                      {String(selectedTime.minutes).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setMode("date")}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      ← Volver
                    </button>
                    <button
                      type="button"
                      onClick={handleTimeConfirm}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

