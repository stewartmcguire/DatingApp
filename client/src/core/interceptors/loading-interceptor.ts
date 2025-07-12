import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { BusyService } from '../services/busy-service';
import { inject } from '@angular/core';
import { delay, finalize, of, tap } from 'rxjs';

// Data cache
const cache = new Map<string, HttpEvent<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  if (req.method === 'GET' && req.headers.get('Cache-Control') !== 'no-cache') {
    const cachedResponse = cache.get(req.url);
    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy();

  return next(req).pipe(
    delay(500),
    tap(response => {
      cache.set(req.url, response);
    }),
    finalize(() => {
      busyService.idle();
    })
  );
};
