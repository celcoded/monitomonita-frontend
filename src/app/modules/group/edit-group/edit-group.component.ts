
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { groupRules } from '../../../enums/group';
import { Subscription } from 'rxjs';
import { GroupService } from '../../../services/group.service';
import { IGroup, IGroupFormDetails, IGroupInput } from '../../../interfaces/group';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { toastTypes } from '../../../enums/toast';
import { GroupFormComponent } from "../group-form/group-form.component";
import { decryptObject } from '../../../utils/helper';
import moment from 'moment';
import { UserService } from '../../../services/user.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-group',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    GroupFormComponent
],
  templateUrl: './edit-group.component.html',
  styleUrl: './edit-group.component.css'
})
export class EditGroupComponent implements OnInit, OnDestroy {
  @Input() code: string = '';
  router = inject(Router);
  groupService = inject(GroupService);
  userService = inject(UserService);
  toastService = inject(ToastService);
  groupForm!: FormGroup;
  groupRules = groupRules;
  maxParticipants: number = environment.maxParticipants || 10;
  
  groupDetails: IGroup | null = null;
  subscriptions = new Subscription();

  formDetails: IGroupFormDetails | null = null;

  constructor(
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    if (!this.userService.getCurrentAdmin()) {
      this.router.navigate([`/`]);
    }

    if (!this.groupService.getCurrentGroup()) {
      this.subscriptions.add(
        this.groupService.getEncryptedDetailsByCode(this.code).subscribe({
          next: async (res) => {
            if (res.data) {
              const data = res.data;
              decryptObject(data.content, data.iv, data.tag, data.key).then((decryptedData) => {
                if (decryptedData) {
                  this.groupService.setCurrentGroup(data);
                  this.groupDetails = decryptedData;
                  this.setGroupFormDetails(decryptedData);
                }
              });
            }
          },
          error: (error) => {
            console.error(error);
            this.router.navigate([`/`]);
          }
        })
      )
    } else {
      const data = this.groupService.getCurrentGroup();
      if (data) {
        decryptObject(data.content, data.iv, data.tag, data.key).then((decryptedData) => {
          this.groupDetails = decryptedData as IGroup;
          if (this.code !== this.groupDetails?.code || !this.userService.getCurrentAdmin()) {
            this.groupService.clearCurrentGroup();
            this.router.navigate([`/`]);
          }
          if (this.userService.getCurrentAdmin()) {
            const adminId = this.userService.getCurrentAdmin();
            if (this.groupDetails.adminId === adminId) {
              this.setGroupFormDetails(decryptedData);
            } else {
              this.groupService.clearCurrentGroup();
              this.router.navigate([`/`]);
            }
          }
        });
      }
    }
  }

  setGroupFormDetails(groupDetails: IGroup) {
    this.groupForm = this.formBuilder.group({
      name: [groupDetails?.name, [Validators.required, Validators.minLength(3)]],
      adminEmail: [groupDetails?.adminEmail],
      startDate: [moment(groupDetails?.startDate).format('YYYY-MM-DD'), [Validators.required]],
      endDate: [moment(groupDetails?.endDate).format('YYYY-MM-DD'), [Validators.required]],
      // rules
      rules: [groupDetails?.rules],
      cutoffDate: [moment(groupDetails?.cutoffDate).format('YYYY-MM-DD')],
      // participants
      newParticipantName: [null, [Validators.minLength(2)]],
      newParticipantEmail: [null, [Validators.email]],
      participants: [groupDetails?.participants, [Validators.required, Validators.minLength(3), Validators.maxLength(groupDetails?.participants.length > this.maxParticipants ? groupDetails?.participants.length : this.maxParticipants)]]
    });

    // disable email input
    this.groupForm.get('adminEmail')?.disable();

    this.formDetails = {
      title: "Edit Group",
      submitButtonText: "Update",
      cancelButtonText: "Cancel",
      groupData: this.groupForm
    }
  }
  
  async submitClicked(groupInput: IGroupInput) {
    if (!this.groupDetails) {
      this.toastService.add({
        text: 'Group update failed!',
        subtext: 'Please try again later.',
        type: toastTypes.ERROR
      })
      return;
    };

    const {
      participants = []
    } = groupInput;

    if (participants && participants.length > 0) {
      participants.forEach((p: any, index: number) => {
        if (p.id && p.isExisting) {
          const data = this.groupDetails?.participants.find((existingParticipant) => existingParticipant._id === p.id);
          if (data) {
            participants[index] = data;
          }
        }
      });
    }

    this.subscriptions.add(
      await this.groupService.updateGroup(this.groupDetails._id, groupInput).subscribe({
        next: (res) => {
          const data = res.data;
          decryptObject(data.content, data.iv, data.tag, data.key).then((decryptedData) => {
            if (decryptedData) {
              this.groupService.setCurrentGroup(data);
              this.groupDetails = decryptedData;
              this.setGroupFormDetails(decryptedData);
              this.router.navigate([`/group/${this.code}`]);
              this.toastService.add({
                text: 'Updated!',
                subtext: 'Group details has been updated successfully',
                type: toastTypes.SUCCESS
              })
            } else {
              this.toastService.add({
                text: 'Error Occurred!',
                subtext: 'Please try again later.',
                type: toastTypes.ERROR
              })
            }
          });
        },
        error: (error) => {
          this.router.navigate([`/group/${this.code}`]);
          this.toastService.add({
            text: 'Group update failed!',
            subtext: error.error.message,
            type: toastTypes.ERROR
          })
        }
      })
    )
  }

  cancelClicked(isCanceled: boolean) {
    if (isCanceled) {
      this.router.navigate([`/group/${this.code}`]);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
