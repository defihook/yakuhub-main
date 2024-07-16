// types
import { MenuProps } from 'types/menu';
import { createSlice } from '@reduxjs/toolkit';

// initial state
const initialState: MenuProps = {
    openItem: ['dashboard'],
    drawerOpen: false,
    hasWorkspace: false
};

// ==============================|| SLICE - MENU ||============================== //

const menu = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        activeItem(state, action) {
            state.openItem = action.payload;
        },

        openDrawer(state, action) {
            state.drawerOpen = action.payload;
        },

        updateHasWorkspace(state, action) {
            state.hasWorkspace = action.payload;
        }
    }
});

export default menu.reducer;

export const { activeItem, openDrawer, updateHasWorkspace } = menu.actions;
