// Environment configuration
export const ENV = {
  // Chat configuration
  DEFAULT_ROOM_ID: import.meta.env.VITE_DEFAULT_ROOM_ID || "general",
  DEFAULT_ROOM_NAME: import.meta.env.VITE_DEFAULT_ROOM_NAME || "General Chat",

  // Gun.js configuration
  GUN_PEERS: (import.meta.env.VITE_GUN_PEERS || "http://192.168.1.212:8765/gun")
    .split(",")
    .map((peer: string) => peer.trim()),

  // File storage configuration
  FILE_STORAGE_URL: import.meta.env.VITE_FILE_STORAGE_URL || "",

  // Application settings
  MAX_RETRIES: Number.parseInt(import.meta.env.VITE_MAX_RETRIES || "3", 10),
  RETRY_DELAY: Number.parseInt(import.meta.env.VITE_RETRY_DELAY || "2000", 10),
  MESSAGE_POLL_INTERVAL: Number.parseInt(import.meta.env.VITE_MESSAGE_POLL_INTERVAL || "5000", 10),

  // Feature flags
  ENABLE_READ_RECEIPTS: import.meta.env.VITE_ENABLE_READ_RECEIPTS !== "false",
  ENABLE_FILE_UPLOADS: import.meta.env.VITE_ENABLE_FILE_UPLOADS !== "false",
  ENABLE_IMAGE_PREVIEWS: import.meta.env.VITE_ENABLE_IMAGE_PREVIEWS !== "false",
}
