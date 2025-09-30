import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  imports: [
    CommonModule
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  private _onChange: (value: boolean) => void = () => {};
  private _onTouch: () => void = () => {};

  @Input() label: string = '';
  @Input() subText: string = '';
  @Input() disabled: boolean = false;
  @Input() isChecked: boolean = false;

  writeValue(value: any): void {
    this.isChecked = value;
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onClick(): void {
    if (this.disabled) return;
    this.isChecked = !this.isChecked;
    this._onChange(this.isChecked);
    this._onTouch();
  }
}
