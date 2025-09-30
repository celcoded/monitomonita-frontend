import { Component, EventEmitter, Input, Output } from '@angular/core';
import { wishlistInput } from '../../interfaces/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wishlist-item',
  imports: [
    CommonModule
  ],
  templateUrl: './wishlist-item.component.html',
  styleUrl: './wishlist-item.component.css'
})
export class WishlistItemComponent {
  @Input() data: wishlistInput | null = null;
  @Input() hasRemoveButton: boolean = false;
  @Output() removeClicked = new EventEmitter<wishlistInput>();
  isFocused: boolean = false;

  removeButtonClicked(eventData: wishlistInput) {
    this.removeClicked.emit(eventData);
  }
}
