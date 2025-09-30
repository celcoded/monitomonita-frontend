import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GroupService } from '../../services/group.service';
import { ToastService } from '../../services/toast.service';
import { toastTypes } from '../../enums/toast';
import { decryptObject } from '../../utils/helper';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-home',
    imports: [
        // TextboxComponent
        RouterLink,
        FormsModule
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy {
    groupService = inject(GroupService);
    userService = inject(UserService);
    router = inject(Router);
    toastService = inject(ToastService);
    groupCode: string = ''

    subscriptions = new Subscription();

    enterGroup() {
        if (!this.groupCode) return;

        this.subscriptions.add(
            this.groupService.getEncryptedDetailsByCode(this.groupCode).subscribe({
                next: async (res) => {
                    const data = res.data;
                    decryptObject(data.content, data.iv, data.tag, data.key).then((decryptedData) => {
                        if (decryptedData) {
                            this.userService.clearCurrentUser();
                            this.groupService.setCurrentGroup(data);
                            this.router.navigate([`/group/${this.groupCode}`]);
                        }
                    });
                },
                error: (error) => {
                    this.toastService.add({
                        text: 'Not found',
                        subtext: error.error.message,
                        type: toastTypes.ERROR
                    })
                }
            })
        )
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
