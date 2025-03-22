import { writable } from "svelte/store"

// Auth store interfaces
export interface UserData {
  username: string
  email?: string
}

// Create stores
export const user = writable<UserData | null>(null)
export const authLoading = writable<boolean>(false)
export const authError = writable<string | null>(null)

// Auth service functions
export const authService = {
  logout: async () => {
    user.set(null)
    window.location.href = "/login"
  },

  // Check auth status (e.g., on app start)
  checkAuth: async () => {
    authLoading.set(true)
    try {
      // Use Gun.js session recall
      // This is handled by individual components now
      // but could be centralized here
    } catch (error) {
      console.error("Auth check failed:", error)
      user.set(null)
    } finally {
      authLoading.set(false)
    }
  },
}

