import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TextboxComponent } from '../../components/inputs/textbox/textbox.component';

@Component({
    selector: 'app-register',
    imports: [
        TextboxComponent,
        RouterLink
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {

}
