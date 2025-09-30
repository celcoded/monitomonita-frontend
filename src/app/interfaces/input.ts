export type labelValue = {
    value: string,
    label: string | number
}

export type checkboxLabelValue = {
    value: string,
    label: string,
    isChecked?: boolean,
    isDisabled?: boolean,
    subText?: string
}

export type emailNameInput = {
    name: string,
    email?: string,
    id?: string,
    isExisting?: boolean,
    isRemovable?: boolean,
    isDisabled?: boolean
}

export type wishlistInput = {
    name: string,
    url?: string,
    id?: string,
    isExisting?: boolean,
    isRemovable?: boolean,
    isDisabled?: boolean
}