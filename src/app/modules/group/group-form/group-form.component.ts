import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxListComponent } from "../../../components/inputs/checkbox-list/checkbox-list.component";
import { checkboxLabelValue, emailNameInput } from '../../../interfaces/input';
import { GROUP_RULES, groupRules } from '../../../enums/group';
import { EmailNameComponent } from '../../../components/email-name/email-name.component';
import { Subscription } from 'rxjs';
import { GroupService } from '../../../services/group.service';
import { IGroup, IGroupFormDetails, IGroupInput } from '../../../interfaces/group';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { toastTypes } from '../../../enums/toast';
import moment from 'moment';
import { getErrorMessage } from '../../../utils/helper';
import { participantStatus } from '../../../enums/user';
import { IParticipant } from '../../../interfaces/user';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-group-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    EmailNameComponent,
    CheckboxListComponent
],
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.css'
})
export class GroupFormComponent implements AfterViewInit, OnDestroy {
  router: Router;
  groupService: GroupService;
  toastService: ToastService;
  
  // Form Details
  @Input() formDetails: IGroupFormDetails = {};
  @Output() submitClicked = new EventEmitter<IGroupInput>();
  @Output() cancelClicked = new EventEmitter<boolean>();
  
  currentTemplate!: TemplateRef<any>;
  templates: { [key: string]: TemplateRef<any> } = {};
  @ViewChild('groupSelection', { static: true }) groupSelection!: TemplateRef<any>;
  @ViewChild('groupCreation', { static: true }) groupCreation!: TemplateRef<any>;

  rules: checkboxLabelValue[] = [];
  groupForm!: FormGroup;
  groupRules = groupRules;
  participants: emailNameInput[] = [];
  maxParticipants: number = environment.maxParticipants || 10;
  
  startMinDate: string = '';
  startMaxDate: string = '';
  endMinDate: string = '';
  endMaxDate: string = '';
  cutoffMaxDate: string = '';

  groupDetails: IGroup | null = null;
  subscriptions = new Subscription();

  getErrorMessage = getErrorMessage;

  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.router = inject(Router);
    this.groupService = inject(GroupService);
    this.toastService = inject(ToastService);

    this.groupForm = this.formDetails.groupData || formBuilder.group({
      name: [null],
      adminEmail: [null],
      startDate: [null],
      endDate: [null],
      // rules
      rules: [[]],
      cutoffDate: [null],
      // participants
      newParticipantName: [null],
      newParticipantEmail: [null],
      participants: [[]]
    });
  }

  ngAfterViewInit(): void {
    if (this.formDetails.groupData) {
      this.groupForm = this.formDetails.groupData;

      if (this.groupForm.get('participants')?.value.length > 0) {
        const participants: emailNameInput[] = this.groupForm.get('participants')?.value.map((participant: IParticipant) => {
          return {
            name: participant.name,
            email: participant.email,
            id: participant._id,
            isExisting: true,
            isRemovable: participant.status !== participantStatus.PENDING,
            isDisabled: participant.status !== participantStatus.PENDING,
          }
        });

        this.participants = participants;
        this.groupForm.get('participants')?.setValue(participants);
      }
    }
    
    this.rules = GROUP_RULES.map(rule => ({
      label: rule.label as string,
      value: rule.value,
      isChecked: this.groupForm.get('rules')?.value.includes(rule.value as groupRules)
    }));

    this.setDateLimits();
    this.changeDetectorRef.detectChanges();
  }

  setDateLimits(monthInterval: number = 2) {
    const startDate = this.groupForm.get('startDate')?.value;
    const endDate = this.groupForm.get('endDate')?.value;
    const cutoffDate = this.groupForm.get('cutoffDate')?.value;
    let date = moment();

    const minDate = moment(date);
    const startMinDateNext2Months = moment(date).add(2, 'months');
    this.startMinDate = minDate.format('YYYY-MM-DD');
    this.startMaxDate = startMinDateNext2Months.format('YYYY-MM-DD');

    if (startDate) {
      date = moment(startDate);
    }

    const dateAfterInterval = moment(date).add(monthInterval, 'months');
    this.endMinDate = moment(date).format('YYYY-MM-DD');
    this.endMaxDate = dateAfterInterval.format('YYYY-MM-DD');
    this.cutoffMaxDate = moment(endDate).format('YYYY-MM-DD');

    if (endDate) {
      if (moment(endDate) > dateAfterInterval) {
        this.groupForm.get('endDate')?.setValue(this.endMaxDate);
      } else if (moment(endDate) < moment(this.endMinDate)) {
        this.groupForm.get('endDate')?.setValue(this.endMinDate);
      }
    }

    if (cutoffDate) {
      if (moment(cutoffDate) > moment(endDate)) {
        this.groupForm.get('cutoffDate')?.setValue(this.cutoffMaxDate);
      } else if (moment(cutoffDate) < moment(this.endMinDate)) {
        this.groupForm.get('cutoffDate')?.setValue(this.endMinDate);
      }
    }
  }
  
  selectedRules() {
    if (this.groupForm.get('rules')?.value.includes(groupRules.ANYONE_CAN_JOIN)) {
      this.groupForm.get('cutoffDate')?.addValidators(Validators.required);
    } else {
      this.groupForm.get('cutoffDate')?.removeValidators(Validators.required);
    }

    this.groupForm.get('cutoffDate')?.updateValueAndValidity();
  }

  selectTemplate(template: string) {
    if (this.templates[template]) {   
      this.currentTemplate = this.templates[template]; 
    }
  }

  addParticipant() {
    if (this.groupForm.get('participants')?.value.length >= this.maxParticipants) {
      this.groupForm.get('newParticipantName')?.reset();
      this.groupForm.get('newParticipantEmail')?.reset();

      this.toastService.add({
        text: 'Cannot add a new participant!',
        subtext: `Only ${this.maxParticipants} participants are allowed to be added`,
        type: toastTypes.ERROR
      })
      return;
    }

    const name = this.groupForm.get('newParticipantName')?.value;
    const email = this.groupForm.get('newParticipantEmail')?.value || null;

    if (!name || (email && this.groupForm.get('newParticipantEmail')?.invalid)){
      this.toastService.add({
        text: 'Invalid Participant',
        subtext: 'Please enter a valid name or email',
        type: toastTypes.ERROR
      })
      return;
    }

    this.participants.push({
      name,
      email,
    });

    this.groupForm.get('newParticipantName')?.reset();
    this.groupForm.get('newParticipantEmail')?.reset();

    this.groupForm.get('participants')?.setValue(this.participants);
    this.groupForm.get('participants')?.markAsTouched();
  }

  removeParticipant(participant: emailNameInput, index: number) {
    this.participants.splice(index, 1);

    if (this.participants.length >= this.maxParticipants) {
      this.groupForm.get('participants')?.addValidators([Validators.maxLength(this.participants.length)]);
    } else {
      this.groupForm.get('participants')?.addValidators([Validators.maxLength(this.maxParticipants)]);
    }

    this.groupForm.get('participants')?.setValue(this.participants);
    this.groupForm.get('participants')?.markAsTouched();
    this.groupForm.get('participants')?.updateValueAndValidity();
  }

  async submitButtonClicked() {
    this.groupForm.get('newParticipantName')?.reset();
    this.groupForm.get('newParticipantEmail')?.reset();
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    };

    let startDateVal = this.groupForm.get('startDate')?.value;
    let startDate = startDateVal ? moment(this.groupForm.get('startDate')?.value).startOf('day').valueOf() : 0;
    let endDateVal = this.groupForm.get('endDate')?.value;
    let endDate = endDateVal ? moment(this.groupForm.get('endDate')?.value).endOf('day').valueOf() : 0;
    let cutoffDateVal = this.groupForm.get('cutoffDate')?.value;
    let cutoffDate = 0;

    if (this.groupForm.get('rules')?.value.includes(groupRules.ANYONE_CAN_JOIN)) {
      cutoffDate = cutoffDateVal ? moment(this.groupForm.get('cutoffDate')?.value).endOf('day').valueOf() : 0;
    }

    const groupInput: IGroupInput = {
      name: this.groupForm.get('name')?.value,
      adminEmail: this.groupForm.get('adminEmail')?.value,
      startDate,
      endDate,
      cutoffDate,
      participants: this.groupForm.get('participants')?.value,
      rules: this.groupForm.get('rules')?.value,
    };

    this.submitClicked.emit(groupInput);
  }

  cancelButtonClicked() {
    this.cancelClicked.emit(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}