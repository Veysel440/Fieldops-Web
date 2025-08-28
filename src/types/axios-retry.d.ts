import 'axios';
declare module 'axios' {
  interface AxiosRequestConfig {
    _retryCount?: number;
    _retryMax?: number;
  }
}
