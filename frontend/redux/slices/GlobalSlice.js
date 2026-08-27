import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
        view: "persona",
        users: {
            loading: true,
            error: null,
            data: []
        },
        selectedUser: null // null or {...user from users collection}
    }

const GlobalSlice = createSlice({
    name: "Global",
    initialState: {
        ...INITIAL_STATE
    },
    reducers: {
        setView(state, action) {
            state.view = action.payload;
        },
        setUsersLoading(state, action) {
            state.users.loading = action.payload;
        },
        setUsersError(state, action) {
            state.users.error = action.payload;
        },
        setUsersData(state, action) {
            state.users.data = action.payload;
        },
        setSelectedUser(state, action) {
            state.selectedUser = action.payload;
        },
        resetGlobalState: () => INITIAL_STATE,
    }
})

export const {
    setView,
    setUsersLoading,
    setUsersError,
    setSelectedUser,
    setUsersData,
    resetGlobalState,
} = GlobalSlice.actions

export const selectView = (state) => state.Global.view;
export const selectUsers = (state) => state.Global.users;
export const selectSelectedUser = (state) => state.Global.selectedUser;

export default GlobalSlice.reducer
