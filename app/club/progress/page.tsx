"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Edit2, TrendingDown, TrendingUp, Scale, Loader2, Calendar } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import {
  getWeightProgress,
  createWeightEntry,
  updateWeightEntry,
  deleteWeightEntry,
  type WeightEntry,
  type WeightProgressStats,
  type CreateWeightEntryDto,
} from "@/services/user-progress";

export default function ProgressPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">(
    (user?.preferredWeightUnit || "kg") as "kg" | "lb"
  );
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WeightProgressStats | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [formData, setFormData] = useState({
    weightKg: "",
    notes: "",
    recordedAt: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para convertir kg a la unidad preferida
  const convertToPreferredUnit = (weightKg: number): number => {
    if (weightUnit === "lb") {
      return weightKg * 2.20462;
    }
    return weightKg;
  };

  // Función para convertir de la unidad preferida a kg
  const convertToKg = (weight: number): number => {
    if (weightUnit === "lb") {
      return weight / 2.20462;
    }
    return weight;
  };

  // Función para obtener el símbolo de la unidad
  const getUnitSymbol = (): string => {
    return weightUnit === "lb" ? "lb" : "kg";
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await getWeightProgress();
      setStats(data);
    } catch (error) {
      console.error("Error al cargar progreso:", error);
      setError("Error al cargar el progreso");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const weight = parseFloat(formData.weightKg);
    const minWeight = weightUnit === "lb" ? 44 : 20; // 44 lb ≈ 20 kg
    const maxWeight = weightUnit === "lb" ? 1100 : 500; // 1100 lb ≈ 500 kg
    
    if (isNaN(weight) || weight <= 0 || weight > maxWeight) {
      setError(`El peso debe ser un número válido entre ${minWeight} y ${maxWeight} ${getUnitSymbol()}`);
      return;
    }

    try {
      setSubmitting(true);
      // Convertir a kg para almacenar
      const weightInKg = convertToKg(weight);
      const createDto: CreateWeightEntryDto = {
        weightKg: weightInKg,
        notes: formData.notes || undefined,
        recordedAt: formData.recordedAt ? new Date(formData.recordedAt).toISOString() : undefined,
        inputUnit: weightUnit as "kg" | "lb",
      };

      if (editingEntry) {
        // Para actualizar, también necesitamos enviar inputUnit
        await updateWeightEntry(editingEntry.id, { ...createDto, inputUnit: weightUnit as "kg" | "lb" });
      } else {
        await createWeightEntry(createDto);
      }

      await loadProgress();
      setShowAddModal(false);
      setEditingEntry(null);
      setFormData({
        weightKg: "",
        notes: "",
        recordedAt: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      console.error("Error al guardar peso:", error);
      setError(error.response?.data?.message || "Error al guardar el peso");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta entrada?")) {
      return;
    }

    try {
      await deleteWeightEntry(entryId);
      await loadProgress();
    } catch (error) {
      console.error("Error al eliminar entrada:", error);
      alert("Error al eliminar la entrada");
    }
  };

  const handleEdit = (entry: WeightEntry) => {
    setEditingEntry(entry);
    // Convertir de kg a la unidad preferida para mostrar
    const weightInPreferredUnit = convertToPreferredUnit(Number(entry.weightKg));
    setFormData({
      weightKg: weightInPreferredUnit.toFixed(1),
      notes: entry.notes || "",
      recordedAt: new Date(entry.recordedAt).toISOString().split("T")[0],
    });
    setShowAddModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Preparar datos para el gráfico
  const chartData = stats?.entries
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .slice(-10) || []; // Últimos 10 registros

  // Convertir weightKg a número (puede venir como string desde el backend)
  const chartDataWithNumbers = chartData.map((entry) => ({
    ...entry,
    weightKg: typeof entry.weightKg === 'string' ? parseFloat(entry.weightKg) : entry.weightKg,
  }));

  const maxWeight = chartDataWithNumbers.length > 0
    ? Math.max(...chartDataWithNumbers.map((d) => d.weightKg))
    : 0;
  const minWeight = chartDataWithNumbers.length > 0
    ? Math.min(...chartDataWithNumbers.map((d) => d.weightKg))
    : 0;
  const weightRange = maxWeight - minWeight || 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00b2de] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b0b0b]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-3 md:px-8 py-2 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/club")}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold">Mi Progreso</h1>
          </div>
          <button
            onClick={() => {
              setEditingEntry(null);
              setFormData({
                weightKg: "",
                notes: "",
                recordedAt: new Date().toISOString().split("T")[0],
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Agregar peso
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 md:px-8 py-6 md:py-8 space-y-6">
        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#00b2de]/10 border border-[#00b2de]/20">
                  <Scale className="w-5 h-5 text-[#00b2de]" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Peso actual</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.currentWeight ? `${convertToPreferredUnit(Number(stats.currentWeight)).toFixed(1)} ${getUnitSymbol()}` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Scale className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Peso inicial</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.startingWeight ? `${convertToPreferredUnit(Number(stats.startingWeight)).toFixed(1)} ${getUnitSymbol()}` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {stats.totalLoss !== null && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <TrendingDown className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Peso perdido</p>
                    <p className="text-2xl font-bold text-green-400">
                      {convertToPreferredUnit(Number(stats.totalLoss)).toFixed(1)} {getUnitSymbol()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.totalGain !== null && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Peso ganado</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {convertToPreferredUnit(Number(stats.totalGain)).toFixed(1)} {getUnitSymbol()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gráfico */}
        {chartData.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
            <h2 className="text-lg font-bold text-white mb-6">Evolución del peso</h2>
            <div className="h-64 flex items-end justify-between gap-2 md:gap-4">
              {chartDataWithNumbers.map((entry, index) => {
                const weight = Number(entry.weightKg);
                const weightInPreferredUnit = convertToPreferredUnit(weight);
                const height = ((weight - minWeight) / weightRange) * 100;
                return (
                  <div key={entry.id} className="flex-1 flex flex-col items-center group">
                    <div
                      className="w-full bg-gradient-to-t from-[#00b2de] to-[#00a0c8] rounded-t transition-all hover:from-[#00a0c8] hover:to-[#008fb1] cursor-pointer relative"
                      style={{
                        height: `${Math.max(height, 5)}%`,
                        minHeight: "4px",
                      }}
                      title={`${formatDate(entry.recordedAt)}: ${weightInPreferredUnit.toFixed(1)} ${getUnitSymbol()}`}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-white/10 rounded px-2 py-1 text-xs whitespace-nowrap">
                        {weightInPreferredUnit.toFixed(1)} {getUnitSymbol()}
                      </div>
                    </div>
                    <span className="text-xs text-white/60 mt-2 text-center">
                      {new Date(entry.recordedAt).toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de entradas */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
          <h2 className="text-lg font-bold text-white mb-4">Historial de peso</h2>
          {stats && stats.entries.length > 0 ? (
            <div className="space-y-3">
              {stats.entries
                .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#00b2de] flex items-center justify-center text-white font-bold text-sm">
                        {convertToPreferredUnit(Number(entry.weightKg)).toFixed(1)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{getUnitSymbol()}</p>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.recordedAt)}
                        </div>
                        {entry.notes && (
                          <p className="text-white/50 text-xs mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-white/70" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <p className="text-white/60 mb-4">No hay registros de peso aún</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors"
              >
                Agregar primer registro
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar/editar peso */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowAddModal(false);
              setEditingEntry(null);
            }}
          />
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">
              {editingEntry ? "Editar peso" : "Agregar peso"}
            </h2>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Peso
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min={weightUnit === "lb" ? "44" : "20"}
                    max={weightUnit === "lb" ? "1100" : "500"}
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    placeholder={weightUnit === "lb" ? "155.0" : "70.5"}
                    required
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30"
                  />
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setWeightUnit("kg")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        weightUnit === "kg"
                          ? "bg-[#00b2de] text-white"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit("lb")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        weightUnit === "lb"
                          ? "bg-[#00b2de] text-white"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      lb
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.recordedAt}
                  onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Después del entrenamiento..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEntry(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

