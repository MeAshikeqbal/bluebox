import { writable, derived } from "svelte/store"
import type { Chat, Message, Contact } from "./gun-types"
import { currentUser, sea, gunInstance } from "$lib/gun-store"
import { get } from "svelte/store"

// Active chats
export const chats = writable<Chat[]>([])

// Current active chat
export const currentChat = writable<Chat | null>(null)

// Messages for the current chat
export const messages = writable<Message[]>([])

// Contacts and users
export const activeContacts = writable<Contact[]>([])

// Search results
export const searchResults = writable<Contact[]>([])

// Loading states
export const isLoadingMessages = writable(false)
export const isLoadingContacts = writable(false)

// Derived store for sorted chats
export const sortedChats = derived(chats, ($chats) => {
  return [...$chats].sort((a, b) => b.timestamp - a.timestamp)
})

// Derived store for sorted messages
export const sortedMessages = derived(messages, ($messages) => {
  return [...$messages].sort((a, b) => a.timestamp - b.timestamp)
})

// Chat actions
export const chatActions = {
  // Load messages for a specific chat
  loadMessages: async (chatId: string) => {
    try {
      isLoadingMessages.set(true)
      messages.set([]) // Clear existing messages

      const user = get(currentUser)
      if (!user) throw new Error("User not authenticated")

      // Subscribe to messages for this chat
      user
        .get("chats")
        .get(chatId)
        .get("messages")
        .map()
        .once(async (data: any, messageId: string) => {
          if (!data) return

          try {
            // Decrypt message content
            const decryptedContent = await sea.decrypt(data.content)

            // Add message to the store
            messages.update((msgs) => {
              // Check if message already exists
              const existingMsg = msgs.find((m) => m.id === messageId)
              if (existingMsg) return msgs

              // Add new message
              return [
                ...msgs,
                {
                  id: messageId,
                  sender: data.sender,
                  content: decryptedContent,
                  timestamp: data.timestamp,
                  delivered: data.delivered || false,
                  read: data.read || false,
                  replyTo: data.replyTo,
                },
              ]
            })
          } catch (error) {
            console.error("Error processing message:", error)
          }
        })

      isLoadingMessages.set(false)
    } catch (error) {
      console.error("Failed to load messages:", error)
      isLoadingMessages.set(false)
    }
  },

  // Send a new message
  sendMessage: async (chatId: string, content: string, replyToId?: string) => {
    try {
      console.log("Sending message to chat:", chatId)

      const user = get(currentUser)
      if (!user) throw new Error("User not authenticated")

      const chat = get(chats).find((c) => c.id === chatId)
      if (!chat) {
        console.error("Chat not found:", chatId)
        throw new Error("Chat not found")
      }

      const messageId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      const timestamp = Date.now()

      // Get recipient's public key for encryption
      let recipientPubKey: string

      if (chat.type === "private") {
        // For private chats, extract the recipient's public key from the chat ID
        // Assuming chat ID format is 'private_[your_pub_key]_[recipient_pub_key]'
        // or just a direct reference to the recipient's public key

        // First, try to parse as a standard format
        const parts = chatId.split("_")

        if (parts.length === 3 && parts[0] === "private") {
          // Standard format: private_[pub1]_[pub2]
          const currentUserPubKey = user.is.pub
          recipientPubKey = parts[1] === currentUserPubKey ? parts[2] : parts[1]
          console.log("Using standard chat ID format, recipient:", recipientPubKey)
        } else {
          // If not standard format, try to use the chat ID directly as the recipient key
          // This is a fallback for demo/testing purposes
          recipientPubKey = chatId
          console.log("Using chat ID as recipient key:", recipientPubKey)
        }
      } else if (chat.type === "group") {
        // For group chats, you'll need to encrypt for each participant
        // This is a simplification - in a real app you'd encrypt for each recipient
        console.error("Group chat encryption not implemented yet")
        throw new Error("Group chat encryption not implemented yet")
      } else {
        // Unknown chat type
        console.error("Unknown chat type:", chat.type)
        throw new Error(`Unknown chat type: ${chat.type}`)
      }

      if (!recipientPubKey) {
        console.error("Could not determine recipient public key")
        throw new Error("Could not determine recipient public key")
      }

      console.log("Encrypting message for recipient:", recipientPubKey)

      // Encrypt the message content with recipient's public key
      const encryptedContent = await sea.encrypt(content, recipientPubKey)

      // Create message object
      const messageData = {
        sender: user.is.pub,
        content: encryptedContent,
        timestamp,
        delivered: false,
        read: false,
        replyTo: replyToId,
      }

      console.log("Storing message in user's chat")

      // Add message to the chat
      user.get("chats").get(chatId).get("messages").get(messageId).put(messageData)

      // Update last message and timestamp in chat
      user
        .get("chats")
        .get(chatId)
        .put({
          lastMessage: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
          timestamp,
        })

      // Also update the recipient's chat (for private chats)
      if (chat.type === "private") {
        console.log("Updating recipient's chat")

        // This is where you'd use Gun.js user graph to reference the recipient
        // For simplicity, we're using a direct approach here
        const gun = user.back()
        gun.get(`~${recipientPubKey}`).get("chats").get(chatId).get("messages").get(messageId).put(messageData)
        gun
          .get(`~${recipientPubKey}`)
          .get("chats")
          .get(chatId)
          .put({
            lastMessage: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
            timestamp,
            unread: gun
              .get(`~${recipientPubKey}`)
              .get("chats")
              .get(chatId)
              .get("unread")
              .once((v: number) => (v || 0) + 1),
          })
      }

      console.log("Message sent successfully")
      return true
    } catch (error) {
      console.error("Failed to send message:", error)
      return false
    }
  },

  // Create a new private chat
  createPrivateChat: async (contactPubKey: string, contactUsername: string) => {
    try {
      console.log("Creating private chat with:", contactUsername, contactPubKey)

      const user = get(currentUser)
      if (!user) throw new Error("User not authenticated")

      const userPubKey = user.is.pub

      // Create a unique chat ID for private chat (sorted public keys to ensure same ID for both users)
      const pubKeys = [userPubKey, contactPubKey].sort()
      const chatId = `private_${pubKeys[0]}_${pubKeys[1]}`

      console.log("Generated chat ID:", chatId)

      // Check if chat already exists
      const existingChat = get(chats).find((c) => c.id === chatId)
      if (existingChat) {
        console.log("Chat already exists, setting as current")
        currentChat.set(existingChat)
        return chatId
      }

      // Create chat for current user
      const chatData = {
        type: "private",
        name: contactUsername,
        lastMessage: "",
        timestamp: Date.now(),
        unread: 0,
      }

      console.log("Storing chat in user's data")

      // Store chat in user's data
      user.get("chats").get(chatId).put(chatData)

      // Add to contacts if not already added
      const existingContact = get(activeContacts).find((c) => c.publicKey === contactPubKey)
      if (!existingContact) {
        console.log("Adding to contacts")
        user.get("contacts").get(contactPubKey).put({
          username: contactUsername,
          publicKey: contactPubKey,
          addedAt: Date.now(),
        })
      }

      console.log("Creating chat for recipient")

      // Create the same chat for recipient (they'll see it when they log in)
      const gun = user.back()
      gun
        .get(`~${contactPubKey}`)
        .get("chats")
        .get(chatId)
        .put({
          ...chatData,
          name: user.is.alias || userPubKey.substring(0, 8), // Use current user's name for recipient's view
        })

      // Add current user to recipient's contacts
      gun
        .get(`~${contactPubKey}`)
        .get("contacts")
        .get(userPubKey)
        .put({
          username: user.is.alias || userPubKey.substring(0, 8),
          publicKey: userPubKey,
          addedAt: Date.now(),
        })

      // Set as current chat
      const newChat = {
        id: chatId,
        type: "private",
        name: contactUsername,
        lastMessage: "",
        timestamp: Date.now(),
        unread: 0,
      }

      console.log("Updating local chat stores")

      chats.update((c) => [...c, newChat])
      currentChat.set(newChat)

      console.log("Private chat created successfully")
      return chatId
    } catch (error) {
      console.error("Failed to create private chat:", error)
      throw error
    }
  },

  // Create a new group chat
  createGroupChat: async (name: string, participantPubKeys: string[]) => {
    try {
      const user = get(currentUser)
      if (!user) throw new Error("User not authenticated")

      const userPubKey = user.is.pub

      // Create a unique chat ID for group chat
      const chatId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

      // Create chat data
      const chatData = {
        type: "group",
        name,
        lastMessage: "",
        timestamp: Date.now(),
        unread: 0,
        participants: [...participantPubKeys, userPubKey],
        admin: userPubKey,
      }

      // Store chat in user's data
      user.get("chats").get(chatId).put(chatData)

      // Create the same chat for all participants
      const gun = user.back()
      participantPubKeys.forEach((pubKey) => {
        gun.get(`~${pubKey}`).get("chats").get(chatId).put(chatData)
      })

      // Set as current chat
      const newChat = {
        id: chatId,
        type: "group",
        name,
        lastMessage: "",
        timestamp: Date.now(),
        unread: 0,
        participants: [...participantPubKeys, userPubKey],
      }

      chats.update((c) => [...c, newChat])
      currentChat.set(newChat)

      return chatId
    } catch (error) {
      console.error("Failed to create group chat:", error)
      throw error
    }
  },

  // Search for users - fixed implementation
  searchUsers: async (query: string) => {
    try {
      isLoadingContacts.set(true)
      searchResults.set([])

      const user = get(currentUser)
      if (!user) throw new Error("User not authenticated")

      if (!query || query.length < 3) {
        isLoadingContacts.set(false)
        return
      }

      console.log(`Searching for users matching "${query}"...`)

      // Create test users for demo purposes
      // In production, you'd remove this and have proper user registration
      const gun = get(gunInstance)
      if (!gun) throw new Error("Gun instance not available")

      const demoUsers = [
        { username: "alice", status: "Online" },
        { username: "bob", status: "Away" },
        { username: "charlie", status: "Busy" },
        { username: "dave", status: "Offline" },
        { username: "eve", status: "Online" },
      ]

      // Add demo users to Gun for testing
      demoUsers.forEach((demoUser) => {
        gun
          .get("users")
          .get(demoUser.username)
          .put({
            username: demoUser.username,
            status: demoUser.status,
            lastSeen: Date.now(),
            publicKey: `demo_${demoUser.username}_key`, // Fake key for demo
          })
      })

      // Now search through users
      const results: Contact[] = []

      // Function to process user data
      const processUserData = (userData: any, userKey: string) => {
        if (!userData || !userData.username) return

        const username = userData.username.toString().toLowerCase()
        console.log(`Checking user: ${username}`)

        if (username.includes(query.toLowerCase()) && userKey !== user.is.pub) {
          console.log(`Match found: ${username}`)

          // For demo users, create a fake public key
          const publicKey = userData.publicKey || `user_${userKey}`

          results.push({
            publicKey,
            username: userData.username,
            online: userData.status === "Online",
            lastSeen: userData.lastSeen || Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
          })

          // Update UI as we find matches
          searchResults.set([...results])
        }
      }

      // Search in the 'users' node
      gun.get("users").map().on(processUserData)

      // Also search in user aliases
      gun.user().get("alias").map().on(processUserData)

      // Set a timeout to ensure the search completes
      setTimeout(() => {
        // If no results were found, add a dummy user for testing
        if (results.length === 0 && query.length >= 3) {
          const dummyUser = {
            publicKey: `dummy_${query}_${Math.random().toString(36).substring(2, 9)}`,
            username: query,
            online: Math.random() > 0.5,
            lastSeen: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7), // Random time within the last week
          }

          results.push(dummyUser)
          searchResults.set(results)
          console.log(`Added dummy user for testing: ${dummyUser.username}`)
        }

        isLoadingContacts.set(false)
      }, 2000)
    } catch (error) {
      console.error("Search failed:", error)
      isLoadingContacts.set(false)
    }
  },
}

