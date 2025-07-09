import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[preventEnterSubmit]'
})
export class PreventEnterSubmitDirective {
  @HostListener('keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    event.preventDefault();
  }
}
