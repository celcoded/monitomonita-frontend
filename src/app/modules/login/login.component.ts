import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TextboxComponent } from '../../components/inputs/textbox/textbox.component';

@Component({
    selector: 'app-login',
    imports: [
        TextboxComponent,
        // RouterOutlet,
        RouterLink
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

}
