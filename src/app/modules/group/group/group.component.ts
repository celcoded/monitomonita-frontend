import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IGroup } from '../../../interfaces/group';
import { Subscription } from 'rxjs';
import { GroupService } from '../../../services/group.service';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { IParticipant } from '../../../interfaces/user';
import { ToastService } from '../../../services/toast.service';
import { toastTypes } from '../../../enums/toast';
import { decryptObject, deepClone, getErrorMessage } from '../../../utils/helper';
import { GROUP_RULES, groupRules } from '../../../enums/group';
import { participantStatus } from '../../../enums/user';
import moment from 'moment';
import { environment } from '../../../../environments/environment';
import { wishlistInput } from '../../../interfaces/input';
import { WishlistItemComponent } from "../../../components/wishlist-item/wishlist-item.component";
import { validUrlPattern } from '../../../utils/validators';
import { select, Store } from '@ngrx/store';
import { GroupActions } from '../../../store/actions/group.actions';
import { selectGroup } from '../../../store/selectors/group.selectors';
import { IEncryptedData } from '../../../interfaces/general';

@Component({
  selector: 'app-group',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WishlistItemComponent
],
  providers: [
    DatePipe
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent implements AfterViewInit, OnDestroy {
  @Input() code: string = '';
  @ViewChild("blurredBg") blurredBgRef!: ElementRef;
  @ViewChild("pickedNameContainer") pickedNameContainerRef!: ElementRef;
  @ViewChild('welcomeTab', { static: true }) welcomeTabRef!: TemplateRef<any>;
  @ViewChild('enteredGroup', { static: true }) enteredGroupRef!: TemplateRef<any>;
  currentTemplate!: TemplateRef<any>;
  templates: { [key: string]: TemplateRef<any> } = {};
  groupDetails: IGroup | null = null;
  userDetails: IParticipant | null = null;
  isAdmin: boolean = false;
  isAllowedToPick: boolean = false;
  userForm: FormGroup;
  newUserForm: FormGroup;
  wishlistForm: FormGroup;
  namesLeft: IParticipant[] = [];
  pickedParticipant: IParticipant | null = null;
  publicParticipantStatus = participantStatus;
  publicGroupRules = groupRules;
  publicGroupRulesLabel = GROUP_RULES.map(rule => ({
    label: rule.label as string,
    value: rule.value,
  }));
  newUserId: string = '';
  isNewUser: boolean = false;
  isShowingRules: boolean = false;
  isDeleting: boolean = false;
  isAllowedToJoin: boolean = false;
  isGroupOpen: boolean = false;
  isWishlistOpen: boolean = false;
  isOtherWishlistOpen: boolean = false;
  dateToday: number = moment().valueOf();
  maxParticipants: number = environment.maxParticipants || 10;
  maxWishlist: number = environment.maxWishlist || 10;
  wishlist: wishlistInput[] = [];
  otherParticipant: IParticipant | null = null;
  otherWishlist: wishlistInput[] = [];

  groupService: GroupService;
  userService: UserService;
  toastService: ToastService;
  router: Router;
  subscriptions = new Subscription();
  store: Store;

  testGroup$;
  getErrorMessage = getErrorMessage;

  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.groupService = inject(GroupService);
    this.userService = inject(UserService);
    this.toastService = inject(ToastService);
    this.router = inject(Router);
    this.store = inject(Store);

    this.testGroup$ = this.store.pipe(select(selectGroup));

    this.userForm = formBuilder.group({
      userId: [null, [Validators.required]]
    });

    this.newUserForm = formBuilder.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.email]]
    });

    this.wishlistForm = formBuilder.group({
      name: [null, [Validators.minLength(2), Validators.maxLength(100)]],
      url: [null, [Validators.minLength(2), Validators.maxLength(300), validUrlPattern()]],
      wishlist: [[], [Validators.maxLength(this.maxWishlist)]],
    });
  }

  ngAfterViewInit(): void {
    this.testGroup$.subscribe(data => {
      console.log('Group from Store:', data);
    })

    this.templates = {
      welcomeTab: this.welcomeTabRef, 
      enteredGroup: this.enteredGroupRef, 
    }
    this.selectTemplate('welcomeTab');

    if (!this.groupService.getCurrentGroup()) {
      this.subscriptions.add(
        this.groupService.getEncryptedDetailsByCode(this.code).subscribe({
          next: async (res) => {
            if (res.data) {
              const data = res.data;
              this.decryptGroupData(data).then(() => {
                this.isAllowedToJoin = this.groupDetails ? this.groupDetails?.rules?.includes(groupRules.ANYONE_CAN_JOIN) && this.groupDetails?.cutoffDate > moment().valueOf() && this.groupDetails?.endDate > moment().valueOf() : false;
                this.router.navigate([`/group/${this.code}`]);
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
        this.store.dispatch(GroupActions.enterGroup({data}));
        decryptObject(data.content, data.iv, data.tag, data.key).then((decryptedData) => {
          this.groupDetails = decryptedData as IGroup;
          this.isAllowedToJoin = this.groupDetails ? this.groupDetails?.rules?.includes(groupRules.ANYONE_CAN_JOIN) && this.groupDetails?.cutoffDate > moment().valueOf() && this.groupDetails?.endDate > moment().valueOf() : false;
          if (this.code !== this.groupDetails?.code) {
            this.store.dispatch(GroupActions.leaveGroup());
            this.groupService.clearCurrentGroup();
            this.userService.clearCurrentUser();
            this.groupService.getEncryptedDetailsByCode(this.code).subscribe({
              next: async (res) => {
                if (res.data) {
                  const data = res.data;
                  this.decryptGroupData(data).then(() => {
                    this.isAllowedToJoin = this.groupDetails ? this.groupDetails?.rules?.includes(groupRules.ANYONE_CAN_JOIN) && this.groupDetails?.cutoffDate > moment().valueOf() && this.groupDetails?.endDate > moment().valueOf() : false;
                    this.router.navigate([`/group/${this.code}`]);
                  });
                }
              },
              error: (error) => {
                console.error(error);
                this.router.navigate([`/`]);
              }
            })
          }
          if (this.userService.getCurrentUser() || this.userService.getCurrentAdmin()) {
            this.enterGroup(this.userService.getCurrentAdmin() || this.userService.getCurrentUser()?.userId);
          }
        });
      }
    }

    this.changeDetectorRef.detectChanges();
  }

  selectTemplate(template: string) {
    if (this.templates[template]) {
      this.currentTemplate = this.templates[template]; 
    }
  }

  enterGroup(id?: string) {
    const userId = id || this.userForm.get('userId')?.value;
    this.userDetails = this.groupDetails?.participants.find((participant) => participant.userId === userId) || null;
    this.isAdmin = this.groupDetails?.adminId === userId;

    if (this.userDetails || this.isAdmin) {
      this.userService.setCurrentUser(this.userDetails, this.isAdmin && userId);
      this.selectTemplate('enteredGroup')

      this.namesLeft = this.groupDetails?.participants.filter(p => p.wasPickedAt === 0) || [];

      this.pickedParticipant = this.groupDetails?.participants.find((participant) => participant.pickedById === this.userDetails?._id) || null;
    } else {
      this.userService.clearCurrentUser();
      
      this.toastService.add({
        text: 'Cannot enter!',
        subtext: 'Your user ID might be incorrect',
        type: toastTypes.ERROR
      });

      this.router.navigate([`/group/${this.code}`]);
    }

    // if (this.isAdmin) {
      this.groupDetails?.participants.forEach((participant: any) => {
        const pickedName = this.groupDetails?.participants.find((p) => p._id === participant.pickedId);
        participant.pickedName = pickedName?.name;
        const pickedByName = this.groupDetails?.participants.find((p) => p._id === participant.pickedById);
        participant.pickedByName = pickedByName?.name;
      })
    // }

    if (this.groupDetails && this.userDetails) {
      this.isAllowedToPick = (this.userDetails?.hasPickedAt === 0) &&
        (this.groupDetails?.startDate < moment().valueOf() && this.groupDetails?.endDate > moment().valueOf());
      
      this.wishlist = deepClone(this.userDetails.wishlist);

      this.isGroupOpen = this.groupDetails?.startDate < moment().valueOf() && this.groupDetails?.endDate > moment().valueOf();
    }
  }

  createNewUser() {
    if (!this.groupDetails) {
      this.toastService.add({
        text: 'Error Occurred!',
        subtext: 'Please try again later',
        type: toastTypes.ERROR
      });
      return;
    }

    if (this.groupDetails.participants.length >= this.maxParticipants) {
      this.toastService.add({
        text: 'Cannot join!',
        subtext: 'Maximum number of participants have already been reached.',
        type: toastTypes.ERROR
      });
      return;
    }

    this.subscriptions.add(
      this.groupService.joinGroup(this.groupDetails._id, this.newUserForm.value).subscribe({
        next: async (res) => {
          if (res.data) {
            const data = res.data;
            this.decryptGroupData(data).then(() => {
              this.newUserId = this.groupDetails?.participants[this.groupDetails?.participants.length-1].userId || '';
              this.enterGroup(this.newUserId);
            })
          }
        },
        error: (error) => {
          this.toastService.add({
            text: `Can't join!`,
            subtext: error.error.message,
            type: toastTypes.ERROR
          })
        }
      })
    )
  }

  exitGroup() {
    this.testGroup$.subscribe(data => {
      console.log('Group from Store:', data);
    })
    this.store.dispatch(GroupActions.leaveGroup());
    this.userService.clearCurrentUser();
    this.groupService.clearCurrentGroup();

    this.router.navigate([`/`]);
  }

  editGroup() {
    this.router.navigate([`/group/${this.groupDetails?.code}/edit`]);
  }

  deleteGroup(isConfirmed: boolean = false) {
    if (!isConfirmed) {
      this.isDeleting = true;
      return;
    } else {
      this.subscriptions.add(
        this.groupService.deleteGroup(this.groupDetails?._id || '').subscribe({
          next: (res) => {
            this.toastService.add({
              text: 'Deleted!',
              subtext: `${this.groupDetails?.name} has been deleted.`,
              type: toastTypes.SUCCESS
            })
            this.store.dispatch(GroupActions.leaveGroup());
            this.groupService.clearCurrentGroup();
            this.router.navigate([`/`]);
          },
          error: (error) => {
            this.toastService.add({
              text: 'Error Occurred!',
              subtext: error.error.message,
              type: toastTypes.ERROR
            })
          }
        })
      )
    }
  }

  pickName() {
    if (!(this.groupDetails && this.userDetails)) {
      this.toastService.add({
        text: 'Error Occurred!',
        subtext: 'Please try again later',
        type: toastTypes.ERROR
      })
      return;
    }

    this.subscriptions.add(
      this.groupService.pickParticipant(this.groupDetails._id, this.userDetails.userId).subscribe({
        next: async (res) => {
          const data = res.data;
          this.decryptGroupData(data).then(() => {
            this.enterGroup(this.userDetails?.userId);

            const pickedName = this.pickedNameContainerRef?.nativeElement;
            const blurredBg = this.blurredBgRef?.nativeElement;

            if (blurredBg.classList.contains('hidden')) {
              blurredBg.classList.remove('hidden');
              blurredBg.classList.add('flex');
              blurredBg.classList.add('backdrop-blur-sm');
              blurredBg.classList.add('duration-1000');
            }
            if (pickedName.classList.contains('hidden')) {
              pickedName.classList.remove('hidden');
              pickedName.classList.add('flex');
              blurredBg.classList.add('duration-100');
            }

            this.isAllowedToPick = false;
          });
        },
        error: (error) => {
          this.toastService.add({
            text: `Can't pick!`,
            subtext: error.error.message,
            type: toastTypes.ERROR
          })
        }
      })
    )
  }

  hidePickedName() {
    const pickedName = this.pickedNameContainerRef.nativeElement;
    const blurredBg = this.blurredBgRef.nativeElement;

    if (blurredBg.classList.contains('flex')) {
      blurredBg.classList.add('hidden');
      blurredBg.classList.remove('flex');
      blurredBg.classList.remove('backdrop-blur-sm');
      blurredBg.classList.remove('duration-1000');
    }
    if (pickedName.classList.contains('flex')) {
      pickedName.classList.add('hidden');
      pickedName.classList.remove('flex');
      blurredBg.classList.remove('duration-100');
    }
  }

  addWishlist() {
    if (this.wishlistForm.get('wishlist')?.value.length >= this.maxWishlist) {
      this.wishlistForm.get('name')?.reset();
      this.wishlistForm.get('url')?.reset();

      this.toastService.add({
        text: 'Cannot add a new wish!',
        subtext: `Only ${this.maxParticipants} wishes are allowed to be added`,
        type: toastTypes.ERROR
      })
      return;
    }

    const name = this.wishlistForm.get('name')?.value;
    const url = this.wishlistForm.get('url')?.value || null;

    if (!name || (url && this.wishlistForm.get('url')?.invalid)){
      this.toastService.add({
        text: 'Invalid Wish',
        subtext: 'Please enter a valid name or url',
        type: toastTypes.ERROR
      })
      return;
    }

    this.wishlist.push({
      name,
      url,
    });

    this.wishlistForm.get('name')?.reset();
    this.wishlistForm.get('url')?.reset();

    this.wishlistForm.get('wishlist')?.setValue(this.wishlist);
    this.wishlistForm.get('wishlist')?.markAsTouched();
  }

  removeWish(wish: wishlistInput, index: number) {
    this.wishlist.splice(index, 1);

    if (this.wishlist.length >= this.maxWishlist) {
      this.wishlistForm.get('wishlist')?.addValidators([Validators.maxLength(this.wishlist.length)]);
    } else {
      this.wishlistForm.get('wishlist')?.addValidators([Validators.maxLength(this.maxWishlist)]);
    }

    this.wishlistForm.get('wishlist')?.setValue(this.wishlist);
    this.wishlistForm.get('wishlist')?.markAsTouched();
    this.wishlistForm.get('wishlist')?.updateValueAndValidity();
  }
  
  async updateWishlist() {
    this.wishlistForm.get('name')?.reset();
    this.wishlistForm.get('url')?.reset();
    if (this.wishlistForm.invalid) {
      this.wishlistForm.markAllAsTouched();
      return;
    };

    const wishlist = this.wishlistForm.get('wishlist')?.value;

    if (!this.groupDetails) {
      this.toastService.add({
        text: 'Group update failed!',
        subtext: 'Please try again later.',
        type: toastTypes.ERROR
      })
      return;
    };

    if (wishlist && wishlist.length > 0) {
      wishlist.forEach((p: any, index: number) => {
        if (p.id && p.isExisting) {
          const data = this.userDetails?.wishlist.find((existingWish) => existingWish._id === p.id);
          if (data) {
            wishlist[index] = data;
          }
        }
      });
    }

    this.subscriptions.add(
      await this.groupService.updateWishlist(this.groupDetails._id, this.userDetails?._id || '', wishlist).subscribe({
        next: (res) => {
          const data = res.data;
          this.decryptGroupData(data).then(() => {
            this.enterGroup(this.userService.getCurrentUser()?.userId);
            this.toastService.add({
              text: 'Updated!',
              subtext: 'Wishlist has been updated!',
              type: toastTypes.SUCCESS
            })
          });
        },
        error: (error) => {
          this.router.navigate([`/group/${this.code}`]);
          this.toastService.add({
            text: 'Wishlist update failed!',
            subtext: error.error.message,
            type: toastTypes.ERROR
          })
          this.isWishlistOpen = false;
        }
      })
    )
  }

  openWishlist() {
    if (this.userDetails) {
      this.isWishlistOpen = true;
      this.wishlistForm.reset();
      this.wishlist = deepClone(this.userDetails.wishlist);
      this.wishlistForm.get('wishlist')?.setValue(this.wishlist);
    }
  }

  closeWishlist() {
    this.isWishlistOpen = false;
  }

  openOtherWishlist(userId: string = '') {
    this.isOtherWishlistOpen = true;
    this.otherParticipant = this.groupDetails?.participants.find((p) => p._id === userId) || null;
  }

  reload() {
    this.subscriptions.add(
      this.groupService.getEncryptedDetailsByCode(this.code).subscribe({
        next: async (res) => {
          if (res.data) {
            const data = res.data;
            this.decryptGroupData(data).then(() => {
              this.isAllowedToJoin = this.groupDetails ? this.groupDetails?.rules?.includes(groupRules.ANYONE_CAN_JOIN) && this.groupDetails?.cutoffDate > moment().valueOf() && this.groupDetails?.endDate > moment().valueOf() : false;
              if (this.userService.getCurrentUser() || this.userService.getCurrentAdmin()) {
                this.enterGroup(this.userService.getCurrentAdmin() || this.userService.getCurrentUser()?.userId);
              } else {
                this.router.navigate([`/`]);
              }
              
              this.toastService.add({
                text: `Refreshed!`,
                subtext: 'Group details have been refreshed.',
                type: toastTypes.SUCCESS
              })
            });
          }
        },
        error: (error) => {
          console.error(error);
          this.router.navigate([`/`]);
        }
      })
    )
  }

  async decryptGroupData(data: IEncryptedData) {
    await decryptObject(data.content, data.iv, data.tag, data.key).then((decryptedData) => {
      if (decryptedData) {
        if (decryptedData.newUserId) {
          delete decryptedData.newUserId;
        }
        this.groupService.setCurrentGroup(data);
        this.groupDetails = decryptedData;
      } else {
        this.toastService.add({
          text: 'Error Occurred!',
          subtext: 'Please try again later.',
          type: toastTypes.ERROR
        })
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
