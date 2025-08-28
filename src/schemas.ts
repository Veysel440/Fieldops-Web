import { z } from 'zod';

export const Customer = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string().nullish().transform(v => v ?? undefined),
  email: z.string().email().optional().or(z.null()).transform(v => v ?? undefined),
  address: z.string().optional().or(z.null()).transform(v => v ?? undefined),
  createdAt: z.string(),
});
export type CustomerT = z.infer<typeof Customer>;


export const Asset = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  customerId: z.number(),
  lat: z.number().optional().nullable().transform(v => v ?? undefined),
  lng: z.number().optional().nullable().transform(v => v ?? undefined),
  createdAt: z.string(),
});
export type AssetT = z.infer<typeof Asset>;

export const PageOf = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), total: z.number().catch(0) });

export const WorkOrder = z.object({ id:z.number(), code:z.string(), title:z.string(), status:z.enum(['open','in_progress','done']), customerId:z.number(), createdAt:z.string() });
export type WorkOrderT = z.infer<typeof WorkOrder>;

export const Attachment = z.object({ id:z.number(), name:z.string(), size:z.number(), url:z.string().url(), createdAt:z.string() });
export type AttachmentT = z.infer<typeof Attachment>;

export const WOItem = z.object({ id:z.number(), title:z.string(), done:z.boolean() });
export type WOItemT = z.infer<typeof WOItem>;

export const ChecklistTemplate = z.object({ id:z.number(), title:z.string() });
export type ChecklistTemplateT = z.infer<typeof ChecklistTemplate>;

