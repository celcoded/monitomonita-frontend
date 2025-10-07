import { createReducer, on } from "@ngrx/store";
import { IEncryptedData } from "../../interfaces/general";
import { GroupActions } from "../actions/group.actions";

export interface GroupState {
    data: IEncryptedData | null;
}

export const initialState: GroupState = {
    data: null
};

export const groupReducer = createReducer(
    initialState,
    on(GroupActions.enterGroup, (state, {data}) => ({
        ...state,
        data
    })),
    on(GroupActions.leaveGroup, (state) => ({
        ...state,
        data: null
    })),
)
