
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { groupRules } from '../../../enums/group';
import { Subscription } from 'rxjs';
import { GroupService } from '../../../services/group.service';
import { IGroup, IGroupFormDetails, IGroupInput } from '../../../interfaces/group';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { toastTypes } from '../../../enums/toast';
import { GroupFormComponent } from "../group-form/group-form.component";
import moment from 'moment';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-group',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    GroupFormComponent
],
  templateUrl: './add-group.component.html',
  styleUrl: './add-group.component.css'
})
export class AddGroupComponent implements OnDestroy {
  router = inject(Router);
  groupService = inject(GroupService);
  toastService = inject(ToastService);
  groupForm: FormGroup;
  groupRules = groupRules;
  maxParticipants: number = environment.maxParticipants || 10;

  groupDetails: IGroup | null = null;
  subscriptions = new Subscription();

  formDetails: IGroupFormDetails = {}

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.groupForm = formBuilder.group({
      name: [null, [Validators.required, Validators.minLength(3)]],
      adminEmail: [null],
      startDate: [moment().format('YYYY-MM-DD'), [Validators.required]],
      endDate: [moment().format('YYYY-MM-DD'), [Validators.required]],
      // rules
      rules: [[]],
      cutoffDate: [null],
      // participants
      newParticipantName: [null, [Validators.minLength(2)]],
      newParticipantEmail: [null, [Validators.email]],
      participants: [[], [Validators.required, Validators.minLength(3), Validators.maxLength(this.maxParticipants)]]
    });

    this.groupForm.get('rules')?.setValue([groupRules.ADMIN_VISIBLE_HAS_PICKED, groupRules.ADMIN_VISIBLE_WAS_PICKED, groupRules.ADMIN_VISIBLE_PICKS]);

    // disable email input
    this.groupForm.get('adminEmail')?.disable();

    this.formDetails = {
      title: "Create a Group",
      submitButtonText: "Create",
      groupData: this.groupForm
    }
  }
  
  async submitClicked(groupInput: IGroupInput) {
    this.subscriptions.add(
      await this.groupService.createGroup(groupInput).subscribe({
        next: (res) => {
          this.groupService.clearCurrentGroup();
          this.groupDetails = res.data;
        },
        error: (error) => {
          this.toastService.add({
            text: 'Group creation failed!',
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
