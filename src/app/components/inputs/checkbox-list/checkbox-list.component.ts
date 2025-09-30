
import { AfterContentInit, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { checkboxLabelValue } from '../../../interfaces/input';
import { CheckboxComponent } from "../checkbox/checkbox.component";

@Component({
  selector: 'app-checkbox-list',
  imports: [
    CheckboxComponent
],
  templateUrl: './checkbox-list.component.html',
  styleUrl: './checkbox-list.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxListComponent),
      multi: true
    }
  ]
})
export class CheckboxListComponent implements ControlValueAccessor, AfterContentInit {
  private _onChange: (value: string[]) => void = () => {};
  private _onTouch: () => void = () => {};
  @Input() disabled: boolean = false;
  @Input() options: checkboxLabelValue[] = [];
  selectedValues: string[] = [];

  ngAfterContentInit(): void {
    let selectedOptions = this.options.filter((option) => option.isChecked);
    this.selectedValues = selectedOptions.map((option) => option.value);
  }

  onClick(option: checkboxLabelValue, checked: boolean) {
    if (checked) {
      this.selectedValues.push(option.value);
    } else {
      this.selectedValues = this.selectedValues.filter(value => value !== option.value);
    }
    
    this.options = this.options.map(option => ({
      ...option,
      isChecked: this.selectedValues.some(value => value === option.value)
    }))

    this._onChange(this.selectedValues);
    this._onTouch();
  }

  isChecked(value: string): boolean {
    return this.selectedValues.includes(value);
  }

  writeValue(value: string[]): void {
    this.selectedValues = value || [];
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
}
