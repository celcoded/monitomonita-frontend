import { labelValue } from "../interfaces/input";

export enum groupRules {
  ADMIN_VISIBLE_HAS_PICKED = 'admin-visible-has-picked',
  ADMIN_VISIBLE_WAS_PICKED = 'admin-visible-was-picked',
  ADMIN_VISIBLE_PICKS = 'admin-visible-picks',
  ALL_VISIBLE_HAS_PICKED = 'all-visible-has-picked',
  ALL_VISIBLE_WAS_PICKED = 'all-visible-was-picked',
  ALL_VISIBLE_PICKS = 'all-visible-picks',
  ANYONE_CAN_JOIN = 'anyone-can-join',
  ANYONE_CAN_JOIN_LATE = 'anyone-can-join-late',
}

export const GROUP_RULES: labelValue[] = [
  {
    value: 'admin-visible-has-picked',
    label: 'Admin can see who has picked a monito',
  },
  {
    value: 'admin-visible-was-picked',
    label: 'Admin can see who has been picked',
  },
  {
    value: 'admin-visible-picks',
    label: 'Admin can see who each participant picked',
  },
  {
    value: 'all-visible-has-picked',
    label: 'Everyone can see who has picked a monito',
  },
  {
    value: 'all-visible-was-picked',
    label: 'Everyone can see who has been picked',
  },
  {
    value: 'all-visible-picks',
    label: 'Everyone can see who each participant picked',
  },
  {
    value: 'anyone-can-join',
    label: 'Anyone can join the group',
  }
];