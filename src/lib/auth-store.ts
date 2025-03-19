/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { writable, type Writable } from "svelte/store"
import { ENV } from "./env-config"

// Define types for Gun.js
type GunUser = {
  is: any
  auth: (username: string, password: string, cb: (ack: any) => void) => void
  create: (username: string, password: string, cb: (ack: any) => void) => void
  get: (key: string) => any
  put: (data: any, cb?: (ack: any) => void) => void
  leave: () => void
  recall: (options: any, cb: (ack: any) => void) => void
}

type GunInstance = {
  user: () => GunUser
  get: (key: string) => any
}

// Define user type
export interface UserData {
  username: string
  email: string
  createdAt?: string
}

// Create stores for authentication state
export const user: Writable<UserData | null> = writable(null)
export const authError: Writable<string> = writable("")
export const authLoading: Writable<boolean> = writable(false)

// Initialize Gun and user instance
let gun: any = null
let user$: GunUser | null = null
let initialized = false

export function initGun(): { gun: any; user$: GunUser | null } {
  if (typeof window !== "undefined" && !initialized) {
    // Only initialize on client-side
    try {
      const Gun = (window as any).Gun

      if (!gun && Gun) {
        console.log("Initializing Gun.js")
        gun = new Gun({
          peers: ENV.GUN_PEERS, // Use peers from config
          localStorage: false,
          radisk: true,
        })

        user$ = gun.user()
        initialized = true

        // Check if user is already logged in
        user$.recall({ sessionStorage: true }, (ack: any) => {
          console.log("User recall result:", ack)

          if (user$.is) {
            console.log("User is authenticated, loading profile")
            user$.get("profile").once((profile: any) => {
              if (profile) {
                console.log("Profile loaded:", profile)
                user.set({
                  username: profile.username,
                  email: profile.email,
                })
              } else {
                console.log("No profile found for authenticated user")
              }
            })
          } else {
            console.log("User is not authenticated")
            user.set(null)
          }
        })
      }
    } catch (error) {
      console.error("Error initializing Gun:", error)
      initialized = false
    }
  }

  return { gun, user$ }
}

export function getGun(): { gun: any; user$: GunUser | null } {
  if (!initialized) {
    return initGun()
  }
  return { gun, user$ }
}

export function logout(): void {
  authLoading.set(true)

  try {
    const { user$ } = getGun()

    if (user$) {
      // Clear user data from store first
      user.set(null)

      // Then logout from Gun
      user$.leave()

      // Clear any session data
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("gun/")
        localStorage.removeItem("gun/")

        // Force clear all Gun-related items from storage
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("gun/")) {
            sessionStorage.removeItem(key)
          }
        })

        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("gun/")) {
            localStorage.removeItem(key)
          }
        })
      }

      // Reset initialized flag to allow re-initialization
      initialized = false

      // Redirect to login page
      setTimeout(() => {
        authLoading.set(false)
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }, 500)
    } else {
      authLoading.set(false)
    }
  } catch (error) {
    console.error("Logout error:", error)
    authLoading.set(false)
  }
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  let authenticated = false

  const unsubscribe = user.subscribe((value) => {
    authenticated = !!value
  })

  unsubscribe()

  return authenticated
}

// Function to protect routes
export function requireAuth(page: string): boolean {
  if (typeof window !== "undefined") {
    const { user$ } = getGun()

    if (!user$ || !user$.is) {
      window.location.href = "/login"
      return false
    }

    return true
  }

  return false
}