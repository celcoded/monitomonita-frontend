import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IGroup, IGroupInput } from '../interfaces/group';
import { BehaviorSubject, Observable } from 'rxjs';
import { IWishlistObject } from '../interfaces/user';
import { UserService } from './user.service';
import { IEncryptedData } from '../interfaces/general';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  baseUrl = `${environment.baseUrl}/groups`;
  http = inject(HttpClient);
  router = inject(Router);
  userService = inject(UserService);

  currentGroup$ = new BehaviorSubject<IEncryptedData | null>(this.loadCurrentGroup());
  
  constructor() {
    if (!this.getAccessTimestamp()) {
      this.setAccessTimestamp();
    }
  }

  private loadCurrentGroup(): IEncryptedData | null {
    const raw = localStorage.getItem('currentGroup');
    return raw ? JSON.parse(raw) : null;
  }

  setCurrentGroup(group: IEncryptedData) {
    localStorage.setItem('currentGroup', JSON.stringify(group));
    this.setAccessTimestamp();
    this.currentGroup$.next(group);
  }

  getCurrentGroup(): IEncryptedData | null {
    const accessTimestamp = this.getAccessTimestamp();
    if (accessTimestamp) {
      if (moment().diff(moment(+accessTimestamp!), 'minutes') === 10) {
        this.clearCurrentGroup();
      }
    }

    return this.currentGroup$.value;
  }

  clearCurrentGroup() {
    this.userService.clearCurrentUser();
    localStorage.removeItem('currentGroup');

    this.currentGroup$.next(null);
  }
  
  setAccessTimestamp() {
    localStorage.setItem('accessTimestamp', JSON.stringify(moment().valueOf()));
  }

  getAccessTimestamp() {
    return localStorage.getItem('accessTimestamp');
  }

  getDetailsById(groupId: string): Observable<{success: boolean, data: IGroup}> {
    return this.http.get<{success: boolean, data: IGroup}>(`${this.baseUrl}/${groupId}`);
  }

  getDetailsByCode(code: string): Observable<{success: boolean, data: IGroup}> {
    return this.http.get<{success: boolean, data: IGroup}>(`${this.baseUrl}/code/${code}`);
  }

  getEncryptedDetailsByCode(code: string): Observable<{success: boolean, data: IEncryptedData}> {
    return this.http.get<{success: boolean, data: IEncryptedData}>(`${this.baseUrl}/code-enc/${code}`);
  }

  createGroup(data: IGroupInput): Observable<{success: boolean, data: IGroup}> {
    return this.http.post<{success: boolean, data: IGroup}>(`${this.baseUrl}/create`, data);
  }

  updateGroup(groupId: string, data: IGroupInput): Observable<{success: boolean, data: IEncryptedData}> {
    return this.http.patch<{success: boolean, data: IEncryptedData}>(`${this.baseUrl}/update/${groupId}`, data);
  }

  deleteGroup(groupId: string): Observable<{success: boolean, data: IEncryptedData}> {
    return this.http.delete<{success: boolean, data: IEncryptedData}>(`${this.baseUrl}/delete/${groupId}`);
  }

  pickParticipant(groupId: string, userId: string): Observable<{success: boolean, data: IEncryptedData}> {
    return this.http.patch<{success: boolean, data: IEncryptedData}>(`${this.baseUrl}/pick/${groupId}/${userId}`, null);
  }

  joinGroup(groupId: string, data: {name: string, email?: string}): Observable<{success: boolean, data: IEncryptedData}> {
    return this.http.patch<{success: boolean, data: IEncryptedData}>(`${this.baseUrl}/join/${groupId}`, data);
  }

  updateWishlist(groupId: string, userId: string, wishlist: IWishlistObject[]): Observable<{success: boolean, data: IEncryptedData}> {
    return this.http.patch<{success: boolean, data: IEncryptedData}>(`${this.baseUrl}/update/wishlist/${groupId}/${userId}`, wishlist);
  }
}
