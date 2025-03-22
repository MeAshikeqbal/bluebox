// Gun.js and SEA related types
export interface GunInstance {
  user: () => GunUser
  get: (key: string) => GunChain
  on: (callback: (data: any) => void) => void
  off: () => void
}

export interface GunUser {
  back(): unknown
  is: any
  recall: (options: { sessionStorage: boolean }) => GunUser
  create: (username: string, password: string, callback: (ack: any) => void) => void
  auth: (username: string, password: string, callback: (ack: any) => void) => void
  leave: () => void
  get: (key: string) => GunChain
  put: (data: any) => GunChain
}

export interface GunChain {
  get: (key: string) => GunChain
  put: (data: any, callback?: (ack: any) => void) => GunChain
  on: (callback: (data: any, key?: string, _?: any, ev?: any) => void, options?: { change: boolean }) => void
  once: (callback: (data: any, key?: string) => void) => void
  map: () => GunChain
  set: (data: any, callback?: (ack: any) => void) => GunChain
  off: () => void
}

export interface SEA {
  pair: () => Promise<KeyPair>
  sign: (data: any, pair: KeyPair) => Promise<string>
  verify: (data: any, pair: KeyPair) => Promise<any>
  encrypt: (data: any, pair: KeyPair | string) => Promise<string>
  decrypt: (data: any, pair: KeyPair | string) => Promise<any>
  work: (data: any, salt: any, options?: any) => Promise<string>
}

export interface KeyPair {
  pub: string
  priv: string
  epub: string
  epriv: string
}

// Chat application types
export interface Chat {
  id: string
  type: "private" | "group"
  name: string
  lastMessage: string
  timestamp: number
  unread: number
  participants?: string[] // Public keys for group chats
}

export interface Message {
  id: string
  sender: string // Public key
  content: string // Encrypted content
  timestamp: number
  delivered: boolean
  read: boolean
  replyTo?: string // ID of message being replied to
}

export interface Contact {
  publicKey: string
  username: string
  alias?: string
  online: boolean
  lastSeen?: number
}

export interface UserProfile {
  username: string
  publicKey: string
  avatar?: string
  status?: string
  createdAt: number
}

