import { http } from './http';

export type ChecklistTemplate = { id:number; title:string; items:string[]; createdAt:string };
export type WOItem = { id:number; title:string; done:boolean };

export async function listChecklistTemplates() {
  const { data } = await http.get('/checklists/templates');
  return data as { data: ChecklistTemplate[] };
}
export async function createChecklistTemplate(b: { title:string; items:string[] }) {
  const { data } = await http.post('/checklists/templates', b); return data as ChecklistTemplate;
}

export async function listWOChecklist(workOrderId:number) {
  const { data } = await http.get(`/work-orders/${workOrderId}/checklist`);
  return data as { data: WOItem[] };
}
export async function toggleWOItem(workOrderId:number, itemId:number, done:boolean) {
  const { data } = await http.patch(`/work-orders/${workOrderId}/checklist/${itemId}`, { done });
  return data as WOItem;
}
export async function attachTemplateToWO(workOrderId:number, templateId:number) {
  const { data } = await http.post(`/work-orders/${workOrderId}/checklist/attach-template`, { templateId });
  return data as { ok: true };
}
