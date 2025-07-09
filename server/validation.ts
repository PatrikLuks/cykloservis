import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const serviceRecordSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(1),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
  bikeModel: z.string().optional(),
  bikeBrand: z.string().optional(),
  reminder: z.boolean().optional(),
  bikeId: z.string().optional(),
  price: z.union([z.string(), z.number()]).optional(),
  serviceType: z.string().optional(),
  recordType: z.enum(['údržba', 'oprava', 'upgrade', 'garanční servis', 'jiné']).optional(),
  status: z.enum(['nový', 'čeká na díly', 'probíhá', 'hotovo', 'předáno', 'reklamace']).optional(),
  quickFix: z.boolean().optional(),
  durationMinutes: z.number().int().min(0).optional(),
  repairStart: z.string().datetime().optional(),
  timingType: z.enum(['manual', 'auto']).optional(),
});

export const serviceRecordUpdateSchema = serviceRecordSchema.partial();

export const bikeSchema = z.object({
  name: z.string().min(2, 'Název kola musí mít alespoň 2 znaky'),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  status: z.enum(['OK', 'NOT_OK']).optional(),
  parts: z.string().optional(),
  kilometers: z.number().int().min(0).optional(),
  serviceType: z.enum(['UVODNI', 'KOMPLEXNI', 'QUICK_FIX']).optional(),
  quickFix: z.boolean().optional(),
});

export const bikeUpdateSchema = bikeSchema.partial();

export function validateBody(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Neplatná data', details: result.error.errors });
    }
    req.body = result.data;
    next();
  };
}
