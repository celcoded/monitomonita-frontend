import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toastTypes } from '../../enums/toast';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [
    CommonModule
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  type: toastTypes = toastTypes.DEFAULT;
  publicToastTypes = toastTypes;

  toastService = inject(ToastService);

  removeToast(index: number) {
    this.toastService.remove(index);
  }
}
