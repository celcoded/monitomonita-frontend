import { toastTypes } from "../enums/toast";

export interface IToast {
    text: string,
    subtext?: string,
    type?: toastTypes,
}