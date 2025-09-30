import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { emailNameInput } from '../../interfaces/input';

@Component({
  selector: 'app-email-name',
  imports: [
    CommonModule
  ],
  templateUrl: './email-name.component.html',
  styleUrl: './email-name.component.css'
})
export class EmailNameComponent {
  @Input() data: emailNameInput | null = null;
  @Input() hasRemoveButton: boolean = false;
  @Output() removeClicked = new EventEmitter<emailNameInput>();
  isFocused: boolean = false;

  removeButtonClicked(eventData: emailNameInput) {
    this.removeClicked.emit(eventData);
  }
}
