import { http } from './http';
export type Attachment = { id:number; name:string; url:string; size:number; createdAt:string };

export async function listAttachments(entity: 'workOrder'|'asset'|'customer', id:number) {
  const { data } = await http.get(`/attachments`, { params: { entity, id } });
  return data as { data: Attachment[] };
}

export async function uploadAttachment(entity:'workOrder'|'asset'|'customer', id:number, file: File) {
  const f = new FormData(); f.append('file', file);
  f.append('entity', entity); f.append('id', String(id));
  const { data } = await http.post(`/attachments`, f, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data as Attachment;
}
