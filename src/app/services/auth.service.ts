import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUserCred, IUserDetails } from '../interfaces/user';
import { omit } from '../utils/helper';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = `${environment.baseUrl}/auth`;
  http = inject(HttpClient);
  router = inject(Router);

  constructor(
  ) {}

  isAuthenticated$ = new BehaviorSubject<boolean>(!!localStorage.getItem('accessToken'));

  get isAuthenticated(): boolean {
    return this.isAuthenticated$.getValue();
  }

  getAccessToken(): string {
    return localStorage.getItem('accessToken')?.toString() || '';
  }

  setAccessToken(token: any): void {
    localStorage.setItem('accessToken', token);
  }

  removeAccessToken(): void {
    localStorage.removeItem('accessToken');
  }

  setUserDetails(user: IUserDetails): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUserDetails(): IUserDetails | null {
    const data = localStorage.getItem('user');
    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  removeUserDetails(): void {
    localStorage.removeItem('user');
  }

  login(data: IUserCred, redirectTo: string = ''): void {
    this.http.post(`${this.baseUrl}/login`, data, {withCredentials: true}).subscribe({ //change url to login API
      next: (res: any) => {
        const data = res.data;

        this.isAuthenticated$.next(true);
        this.setAccessToken(data.accessToken); //pass access token
        this.setUserDetails(omit(data.user, ['password']));

        if (!!redirectTo) {
          this.router.navigate([redirectTo]);
        }
      },
      error: (error) => {
        console.error(error);
        this.isAuthenticated$.next(false);
        this.router.navigate(['/login']);
      }
    })
  }

  logout(redirectTo: string = ''): void {
    const userId = this.getUserDetails()?._id || ''
    this.http.post(`${this.baseUrl}/logout`, {userId}, {withCredentials: true}).subscribe({
      next: (res) => {
        this.isAuthenticated$.next(false);
        this.removeAccessToken();
        this.removeUserDetails();

        if (!!redirectTo) {
          this.router.navigate([redirectTo]);
        }
      },
      error: (error) => {
        this.isAuthenticated$.next(false);
        if (!!redirectTo) {
          this.router.navigate([redirectTo]);
        }
      }
    })
  }

  register(data: IUserCred): Observable<IUserDetails> {
    return this.http.post<IUserDetails>(`${this.baseUrl}/register`, data);
  }

  refreshToken(): Observable<any> {
    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/refresh-token`, {}, {withCredentials: true});
  }

  forgotPassword(email: string, redirectTo: string = ''): void {
    this.http.post(`${this.baseUrl}/forgot-password`, email).subscribe({
      next: (res) => {
        if (!!redirectTo) {
          this.router.navigate([redirectTo]);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  resetPassword(token: string, password: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/reset-password`, {token, password});
  }
}