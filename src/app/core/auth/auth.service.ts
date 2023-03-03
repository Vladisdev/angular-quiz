import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponseType } from '../../../types/login-response.type';
import { Observable, Subject, tap } from 'rxjs';
import { UserInfoType } from '../../../types/user-info.type';
import { LogoutResponseType } from '../../../types/logout-response.type';
import { SignupResponseType } from '../../../types/signup-response.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  accessTokenKey: string = 'accessToken';

  private refreshTokenKey: string = 'refreshToken';
  private userInfoKey: string = 'userInfo';

  isLogged$: Subject<boolean> = new Subject<boolean>();
  private isLogged: boolean = false;

  constructor(private http: HttpClient) {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);
  }

  signup(
    name: string,
    lastName: string,
    email: string,
    password: string
  ): Observable<LoginResponseType> {
    return this.http.post<SignupResponseType>(environment.apiHost + 'signup', {
      name,
      lastName,
      email,
      password,
    });
  }

  login(email: string, password: string): Observable<LoginResponseType> {
    return this.http
      .post<LoginResponseType>(environment.apiHost + 'login', {
        email,
        password,
      })
      .pipe(
        tap((data: LoginResponseType) => {
          if (
            data.fullName &&
            data.userId &&
            data.email &&
            data.accessToken &&
            data.refreshToken
          ) {
            this.setUserInfo({
              fullName: data.fullName,
              userId: data.userId,
              email: data.email,
            });
            this.setTokens(data.accessToken, data.refreshToken);
          }
        })
      );
  }

  logout(): Observable<LogoutResponseType> {
    const refreshToken: string | null = localStorage.getItem(
      this.refreshTokenKey
    );
    return this.http.post<LogoutResponseType>(environment.apiHost + 'logout', {
      refreshToken,
    });
  }

  getLoggedIn(): boolean {
    return this.isLogged;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true);
  }

  removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(false);
  }

  setUserInfo(info: UserInfoType): void {
    localStorage.setItem(this.userInfoKey, JSON.stringify(info));
  }

  removeUserInfo(): void {
    localStorage.removeItem(this.userInfoKey);
  }

  getUserInfo(): UserInfoType | null {
    const userInfo: string | null = localStorage.getItem(this.userInfoKey);
    if (userInfo) {
      return JSON.parse(userInfo);
    }

    return null;
  }
}