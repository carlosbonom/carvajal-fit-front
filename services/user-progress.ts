import { apiAxios } from "@/lib/axios-config";

export interface WeightEntry {
  id: string;
  weightKg: number;
  notes: string | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeightProgressStats {
  currentWeight: number | null;
  startingWeight: number | null;
  totalLoss: number | null;
  totalGain: number | null;
  entries: WeightEntry[];
}

export interface CreateWeightEntryDto {
  weightKg: number;
  notes?: string;
  recordedAt?: string;
  inputUnit?: 'kg' | 'lb'; // Unidad en la que se ingresa el peso
}

export interface UpdateWeightEntryDto {
  weightKg?: number;
  notes?: string;
  recordedAt?: string;
  inputUnit?: 'kg' | 'lb'; // Unidad en la que se ingresa el peso
}

// GET /user-progress/weight - Obtener progreso de peso
export const getWeightProgress = async (): Promise<WeightProgressStats> => {
  const response = await apiAxios.get<WeightProgressStats>("/user-progress/weight");
  return response.data;
};

// POST /user-progress/weight - Crear entrada de peso
export const createWeightEntry = async (
  data: CreateWeightEntryDto,
): Promise<WeightEntry> => {
  const response = await apiAxios.post<WeightEntry>("/user-progress/weight", data);
  return response.data;
};

// PATCH /user-progress/weight/:entryId - Actualizar entrada de peso
export const updateWeightEntry = async (
  entryId: string,
  data: UpdateWeightEntryDto,
): Promise<WeightEntry> => {
  const response = await apiAxios.patch<WeightEntry>(
    `/user-progress/weight/${entryId}`,
    data,
  );
  return response.data;
};

// DELETE /user-progress/weight/:entryId - Eliminar entrada de peso
export const deleteWeightEntry = async (entryId: string): Promise<void> => {
  await apiAxios.delete(`/user-progress/weight/${entryId}`);
};

