import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken() || '';

  const isAuthRequired = !!accessToken && req.url.startsWith(environment.baseUrl);
  if (!isAuthRequired) {
    return next(req);
  }

  const newRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    },
  })

  return next(newRequest).pipe(
    catchError((error) => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(res => {
            const data = res.data;
            if (!res.success) {
              authService.logout('/login');
              return throwError(() => error);
            }

            authService.setAccessToken(data.newAccessToken);

            const retryRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${data.newAccessToken}`,
              },
            });
  
            return next(retryRequest);
          })
        )
      }
      return throwError(() => error);
    })
  )
};
