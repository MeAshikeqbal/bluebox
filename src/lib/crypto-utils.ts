/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import type { KeyPair } from "../routes/chat/gun-types"
declare var SEA: any

// These functions are wrappers around SEA methods to handle E2E encryption

// Generate a new key pair
export async function generateKeyPair(): Promise<KeyPair> {
  try {
    return await SEA.pair()
  } catch (error) {
    console.error("Failed to generate keypair:", error)
    throw error
  }
}

// Encrypt data with a public key
export async function encryptData(data: any, pubKey: string): Promise<string> {
  try {
    return await SEA.encrypt(JSON.stringify(data), pubKey)
  } catch (error) {
    console.error("Encryption failed:", error)
    throw error
  }
}

// Decrypt data with your private key
export async function decryptData(encryptedData: string, pair: KeyPair): Promise<any> {
  try {
    const decrypted = await SEA.decrypt(encryptedData, pair)
    return decrypted ? JSON.parse(decrypted as string) : null
  } catch (error) {
    console.error("Decryption failed:", error)
    return null
  }
}

// Sign data with your key pair
export async function signData(data: any, pair: KeyPair): Promise<string> {
  try {
    return await SEA.sign(JSON.stringify(data), pair)
  } catch (error) {
    console.error("Signing failed:", error)
    throw error
  }
}

// Verify signed data
export async function verifyData(signedData: string, pubKey: string): Promise<any> {
  try {
    const verified = await SEA.verify(signedData, pubKey)
    return verified ? JSON.parse(verified as string) : null
  } catch (error) {
    console.error("Verification failed:", error)
    return null
  }
}

// Create a shared secret between two users
export async function createSharedSecret(pair: KeyPair, otherPubKey: string): Promise<string> {
  try {
    return await SEA.secret(otherPubKey, pair)
  } catch (error) {
    console.error("Failed to create shared secret:", error)
    throw error
  }
}

// Encrypt with a shared secret
export async function encryptWithSharedSecret(data: any, sharedSecret: string): Promise<string> {
  try {
    return await SEA.encrypt(JSON.stringify(data), sharedSecret)
  } catch (error) {
    console.error("Shared secret encryption failed:", error)
    throw error
  }
}

// Decrypt with a shared secret
export async function decryptWithSharedSecret(encryptedData: string, sharedSecret: string): Promise<any> {
  try {
    const decrypted = await SEA.decrypt(encryptedData, sharedSecret)
    return decrypted ? JSON.parse(decrypted as string) : null
  } catch (error) {
    console.error("Shared secret decryption failed:", error)
    return null
  }
}

