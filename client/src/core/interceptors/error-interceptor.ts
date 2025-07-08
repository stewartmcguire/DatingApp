import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error) {
        // Handle the error
        switch (error.status) {
          case 400:
            // Handle 400 error
            if (error.error.errors) {
              const modelStateErrors = [];
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modelStateErrors.push(error.error.errors[key]);
                }
              }
              throw modelStateErrors.flat();
            }
            else {
              toast.error(error.error);
            }

            break;
          case 401:
            // Handle 401 error
            toast.error('Unauthorized');
            break;
          case 404:
            // Handle 404 error
            router.navigateByUrl('/not-found');
            break;
          case 500:
            // Handle 500 error
            const navigationExtras = { state: { error: error.error } };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            // Handle other errors
            toast.error('An unexpected error occurred');
            break;
        }
      }
      throw error; // Re-throw the error to propagate it
    })
  );
};
