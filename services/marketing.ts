import { apiAxios } from "@/lib/axios-config";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateDto {
  name: string;
  subject: string;
  htmlContent: string;
}

export interface UpdateEmailTemplateDto {
  name?: string;
  subject?: string;
  htmlContent?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  [key: string]: any; // Para campos adicionales del Excel
}

export interface SendEmailDto {
  templateId: string;
  recipients: EmailRecipient[];
  subject?: string; // Opcional, si se quiere sobrescribir el subject de la plantilla
}

// GET /marketing/templates - Obtener todas las plantillas
export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  const response = await apiAxios.get<EmailTemplate[]>("/marketing/templates");
  return response.data;
};

// GET /marketing/templates/:id - Obtener una plantilla por ID
export const getEmailTemplate = async (id: string): Promise<EmailTemplate> => {
  const response = await apiAxios.get<EmailTemplate>(`/marketing/templates/${id}`);
  return response.data;
};

// POST /marketing/templates - Crear una nueva plantilla
export const createEmailTemplate = async (
  data: CreateEmailTemplateDto
): Promise<EmailTemplate> => {
  const response = await apiAxios.post<EmailTemplate>("/marketing/templates", data);
  return response.data;
};

// PATCH /marketing/templates/:id - Actualizar una plantilla
export const updateEmailTemplate = async (
  id: string,
  data: UpdateEmailTemplateDto
): Promise<EmailTemplate> => {
  const response = await apiAxios.patch<EmailTemplate>(
    `/marketing/templates/${id}`,
    data
  );
  return response.data;
};

// DELETE /marketing/templates/:id - Eliminar una plantilla
export const deleteEmailTemplate = async (id: string): Promise<void> => {
  await apiAxios.delete(`/marketing/templates/${id}`);
};

// POST /marketing/send - Enviar correos masivos
export const sendBulkEmails = async (data: SendEmailDto): Promise<{
  success: number;
  failed: number;
  errors?: string[];
}> => {
  const response = await apiAxios.post<{
    success: number;
    failed: number;
    errors?: string[];
  }>("/marketing/send", data);
  return response.data;
};






