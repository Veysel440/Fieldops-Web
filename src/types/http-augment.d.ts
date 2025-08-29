import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Mutasyonda koşullu istek gönder: If-Match/If-Unmodified-Since otomatik eklenir. */
    conditional?: boolean;
  }
}
