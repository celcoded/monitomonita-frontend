import { Injectable } from '@angular/core';
import { IParticipant } from '../interfaces/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser$ = new BehaviorSubject<IParticipant | null>(this.loadUser());
  currentAdmin$ = new BehaviorSubject<string | null>(this.loadAdmin());

  constructor() {}

  private loadUser(): IParticipant | null {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  }

  private loadAdmin(): string | null {
    const raw = localStorage.getItem('currentAdmin');
    return raw || null ;
  }

  setCurrentUser(user: IParticipant | null, adminId?: string): void {
    this.clearCurrentUser();
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser$.next(user);
    }
    if (adminId) {
      localStorage.setItem('currentAdmin', String(adminId));
      this.currentAdmin$.next(adminId);
    }
  }

  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAdmin');
    this.currentUser$.next(null);
    this.currentAdmin$.next(null);
  }

  getCurrentUser(): IParticipant | null {
    return this.currentUser$.value;
  }

  getCurrentAdmin(): string | null {
    return this.currentAdmin$.value;
  }
}
