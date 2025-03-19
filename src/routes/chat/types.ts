// Message type
export interface Message {
  id: string
  sender: string
  text: string
  timestamp: number
  attachments?: string[] | { [key: string]: string } // Can be array or object
  isRead: boolean
}

// Chat room member type
export interface ChatRoomMember {
  joined: number
  lastRead: number
  active: boolean
  lastActive: number
}

// Last message preview type
export interface LastMessagePreview {
  text: string
  sender: string
  timestamp: number
}

// Chat room type
export interface ChatRoom {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  members: {
    [username: string]: ChatRoomMember
  }
  lastMessage: LastMessagePreview | null
}

// User presence type
export interface UserPresence {
  online: boolean
  lastSeen: number
}

