import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { IEncryptedData } from "../../interfaces/general";

// export const enterGroup = createAction('[Group] Enter Group');
// export const leaveGroup = createAction('[Group] Leave Group');

export const GroupActions = createActionGroup({
    source: 'Group',
    events: {
        'Enter Group': props<{ data: IEncryptedData }>(),
        'Leave Group': emptyProps(),
    }
})