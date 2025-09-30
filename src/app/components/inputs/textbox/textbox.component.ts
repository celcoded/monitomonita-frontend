import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-textbox',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextboxComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextboxComponent implements ControlValueAccessor{
  control = new FormControl('');
  private _onChange: (value: string) => void = () => {};
  private _onTouch: () => void = () => {};
  private _isDisabled: boolean = false;

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';

  isToggleOn: boolean = false;

  constructor() {
    this.control.valueChanges.pipe(debounceTime(100)).subscribe(value => {
      this._onChange(value || '');
      this._onTouch();
    })
  }

  writeValue(value: any): void {
    this.control.setValue(value || '', {emitEvent: false});
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }

  onToggle() {
    this.isToggleOn = !this.isToggleOn;
  }
}
