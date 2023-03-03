import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { RefreshResponseType } from '../../../types/refresh-response.type';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const tokens = this.authService.getTokens();

    if (tokens.accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('x-access-token', tokens.accessToken),
      });

      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (
            error.status === 401 &&
            !authReq.url.includes('/login') &&
            !authReq.url.includes('/refresh')
          ) {
            return this.handle401Error(authReq, next);
          }

          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.refresh().pipe(
      switchMap((response: RefreshResponseType) => {
        if (
          response &&
          !response.error &&
          response.accessToken &&
          response.refreshToken
        ) {
          this.authService.setTokens(
            response.accessToken,
            response.refreshToken
          );

          const authReq = req.clone({
            headers: req.headers.set('x-access-token', response.accessToken),
          });

          return next.handle(authReq);
        } else {
          return throwError(() => new Error('error'));
        }
      }),
      catchError((error) => {
        this.authService.removeTokens();
        this.authService.removeUserInfo();
        this.router.navigate(['/']);
        return throwError(() => error);
      })
    );
  }
}
