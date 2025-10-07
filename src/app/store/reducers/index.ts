import { isDevMode } from '@angular/core';
import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { groupReducer, GroupState } from './group.reducer';

export interface State {
  group: GroupState
}

export const reducers: ActionReducerMap<State> = {
  group: groupReducer
};


export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
