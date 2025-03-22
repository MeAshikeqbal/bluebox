/* eslint-disable @typescript-eslint/no-explicit-any */
import { writable, get } from "svelte/store"
import type { GunInstance, GunUser } from "../routes/chat/gun-types"
// We declare Gun as any type since we're loading it via script tag
declare let Gun: any

// Gun instance store
export const gunInstance = writable<GunInstance | null>(null)

// Current authenticated user
export const currentUser = writable<GunUser | null>(null)

// Gun initialization state
export const gunInitialized = writable<boolean>(false)

// Initialize Gun
export function initializeGun() {
  try {
    console.log("Initializing Gun.js...")

    // Create Gun instance
    const gun = new Gun({
      peers: [
        "http://192.168.1.7:8765/gun", // Local development
      ],
      localStorage: false, // Don't use localStorage
      radisk: true, // Use RadISK for better IndexedDB storage
      axe: false, // Disable DHT in the browser
    })

    // Update the store
    gunInstance.set(gun)
    gunInitialized.set(true)
    console.log("Gun.js initialized successfully")

    return gun
  } catch (error) {
    console.error("Failed to initialize Gun.js:", error)
    throw error
  }
}

// SEA (Security, Encryption, Authorization) utilities
export const sea = {
  // Generate a new key pair
  generateKeyPair: async () => {
    try {
      return await Gun.SEA.pair()
    } catch (error) {
      console.error("Failed to generate keypair:", error)
      throw error
    }
  },

  // Encrypt data for a specific user (using their public key)
  encrypt: async (data: any, pubKey: string) => {
    try {
      return await Gun.SEA.encrypt(data, pubKey)
    } catch (error) {
      console.error("Encryption failed:", error)
      throw error
    }
  },

  // Decrypt data with the current user's key pair
  decrypt: async (encryptedData: string) => {
    try {
      const user = get(currentUser)
      if (!user?.is) throw new Error("User not authenticated")

      return await Gun.SEA.decrypt(encryptedData, user)
    } catch (error) {
      console.error("Decryption failed:", error)
      throw error
    }
  },

  // Sign data with the current user's key pair
  sign: async (data: any) => {
    try {
      const user = get(currentUser)
      if (!user?.is) throw new Error("User not authenticated")

      return await Gun.SEA.sign(data, user)
    } catch (error) {
      console.error("Signing failed:", error)
      throw error
    }
  },

  // Verify signed data
  verify: async (signedData: string, pubKey: string) => {
    try {
      return await Gun.SEA.verify(signedData, pubKey)
    } catch (error) {
      console.error("Verification failed:", error)
      return null
    }
  },
}

