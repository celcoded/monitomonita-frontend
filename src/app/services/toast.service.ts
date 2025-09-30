import { Injectable } from '@angular/core';
import { IToast } from '../interfaces/toast';
import { toastTypes } from '../enums/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: IToast[] = [];

  constructor() { }

  add(data: IToast, duration: number = 4000) {
    if (!data.type) {
      data.type = toastTypes.DEFAULT;
    }
    this.toasts.push(data);
    setTimeout(() => this.remove(0), duration);
  }

  remove(index: number) {
    if (!this.toasts[index]) return;
    this.toasts.splice(index, 1);
  }
}
