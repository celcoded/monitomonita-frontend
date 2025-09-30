import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appInputFocus]'
})
export class InputFocusDirective {
  element = inject(ElementRef);

  constructor(
  ) { }

  @HostListener('click')
  onClick() {
    const input = this.element.nativeElement.querySelector('input');
    input?.focus();
  }

}
