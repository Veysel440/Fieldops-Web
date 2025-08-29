export function throttle<T extends(...a:any[])=>any>(fn:T, ms:number){
  let last = 0, timer: any = null, lastArgs: any[] = [];
  return (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;
    if (now - last >= ms) { last = now; fn(...args); }
    else {
      clearTimeout(timer);
      timer = setTimeout(()=>{ last = Date.now(); fn(...lastArgs); }, ms - (now-last));
    }
  };
}
