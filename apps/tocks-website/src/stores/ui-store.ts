import { create } from 'zustand'

interface UIState {
  isMenuOpen: boolean
  isScrolled: boolean
  activeSection: string
  toggleMenu: () => void
  closeMenu: () => void
  setScrolled: (scrolled: boolean) => void
  setActiveSection: (section: string) => void
}

export const useUIStore = create<UIState>()((set) => ({
  isMenuOpen: false,
  isScrolled: false,
  activeSection: '',
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
  setScrolled: (scrolled) => set({ isScrolled: scrolled }),
  setActiveSection: (section) => set({ activeSection: section }),
}))
