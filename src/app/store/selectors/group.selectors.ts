import { createFeatureSelector, createSelector } from "@ngrx/store";
import { GroupState } from "../reducers/group.reducer";

export const selectGroupState = createFeatureSelector<GroupState>('group');

export const selectGroup = createSelector(
    selectGroupState,
    (state) => state.data
)