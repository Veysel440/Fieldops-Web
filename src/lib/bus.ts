import mitt from 'mitt';
export type Events = { toast: { type:'success'|'error'|'info'; text:string } };
export const bus = mitt<Events>();
