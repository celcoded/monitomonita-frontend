import { participantStatus, userRoles } from "../enums/user"

export interface IUser {
    _id: string,
    name: string,
    userId: string,
    email: string,
    password: string,
    role: userRoles,
    deactivatedAt: number,
    deletedAt: number,
    createdAt: number,
    updatedAt: number
}

export interface IUserInput extends Pick<IUser, 'name' | 'email' | 'password' | 'role'> {}

export interface IUserCred extends Pick<IUser, 'email' | 'password'> {}

export interface IUserDetails extends Omit<IUser, 'password'> {}

export interface IParticipant extends Pick<IUser, '_id' | 'name' | 'userId' | 'email'> {
    status: participantStatus,
    hasPickedAt: number,
    wasPickedAt: number,
    doneAt: number,
    addedAt: number,
    pickedById: string,
    pickedId: string,
    wishlist: IWishlistObject[],
    pickedName?: string,
    pickedByName?: string,
}

export interface IWishlistObject {
    _id: string,
    name: string,
    url: string
}