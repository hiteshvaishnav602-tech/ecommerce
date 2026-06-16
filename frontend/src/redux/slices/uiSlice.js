import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: true,
    sidebarOpen: false,
    megaMenuOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
  },
  reducers: {
    toggleDarkMode: (state) => { state.darkMode = !state.darkMode },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload },
    toggleMegaMenu: (state) => { state.megaMenuOpen = !state.megaMenuOpen },
    setMegaMenuOpen: (state, action) => { state.megaMenuOpen = action.payload },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen },
    setSearchOpen: (state, action) => { state.searchOpen = action.payload },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen },
    setMobileMenuOpen: (state, action) => { state.mobileMenuOpen = action.payload },
  },
})

export const {
  toggleDarkMode, toggleSidebar, setSidebarOpen,
  toggleMegaMenu, setMegaMenuOpen,
  toggleSearch, setSearchOpen,
  toggleCartSidebar, setCartSidebarOpen,
  toggleMobileMenu, setMobileMenuOpen,
} = uiSlice.actions

export default uiSlice.reducer
