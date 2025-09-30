import { FormGroup } from "@angular/forms";
import { groupRules } from "../enums/group";
import { IParticipant } from "./user";

export interface IGroup {
    _id: string,
    name: string,
    code: string,
    adminEmail: string,
    adminId: string,
    participants: IParticipant[],
    rules: groupRules[],
    startDate: number,
    endDate: number,
    cutoffDate: number,
    deactivatedAt: number,
    deletedAt: number,
    createdAt: number,
    updatedAt: number,
}

export interface IGroupInput extends Pick<IGroup, 'name' | 'adminEmail' | 'participants' | 'startDate' | 'rules' | 'startDate' | 'endDate' | 'cutoffDate'> {
    _id?: string
}

export interface IGroupFormDetails {
    title?: string,
    submitButtonText?: string,
    cancelButtonText?: string,
    groupData?: FormGroup
}