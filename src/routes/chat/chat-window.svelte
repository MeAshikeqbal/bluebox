<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { getGun, user } from '../../lib/auth-store';
  import MessageList from './message-list.svelte';
  import MessageInput from './message-input.svelte';
  import { writable, type Writable } from 'svelte/store';
  import type { Message, ChatRoom } from './types';
  
  // Props
  export let roomId: string = 'general';
  export let roomName: string = 'General Chat';
  
  // Local state
  let messages: Writable<Message[]> = writable([]);
  let isLoading: boolean = true;
  let error: string = '';
  let currentUser: { username: string; email: string } | null = null;
  let gun: any;
  let messagesRef: any;
  let roomData: ChatRoom | null = null;
  let unreadCount: number = 0;
  let isAtBottom: boolean = true;
  let messageListElement: HTMLElement;
  let lastReadTimestamp: number = 0;
  let initRetries: number = 0;
  let maxRetries: number = 3;
  let activeUsers: number = 0;
  
  // Subscribe to user store
  const unsubscribeUser = user.subscribe(value => {
    currentUser = value;
    
    // If user changes, try to reinitialize chat if needed
    if (currentUser && error === 'You must be logged in to send messages') {
      console.log('User logged in, reinitializing chat');
      error = '';
      initRetries = 0;
      setTimeout(initChat, 500); // Wait a bit before initializing
    }
  });
  
  // Function to handle sending a new message
  function handleSendMessage(event: CustomEvent<{ text: string; attachments?: string[] }>) {
    if (!currentUser) {
      error = 'You must be logged in to send messages';
      return;
    }
    
    if (!gun || !messagesRef) {
      error = 'Chat not properly initialized. Please try again.';
      return;
    }
    
    const { text, attachments } = event.detail;
    
    if (!text.trim() && (!attachments || attachments.length === 0)) {
      return;
    }
    
    try {
      const messageData: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: currentUser.username,
        text: text.trim(),
        timestamp: Date.now(),
        attachments: attachments || [],
        isRead: false
      };
      
      // Save message to Gun.js
      messagesRef.get(messageData.id).put(messageData);
      
      // Update room's last message
      if (roomData) {
        gun.get('chatRooms').get(roomId).put({
          lastMessage: {
            text: text.length > 30 ? text.substring(0, 30) + '...' : text,
            sender: currentUser.username,
            timestamp: messageData.timestamp
          },
          updatedAt: messageData.timestamp
        });
      }
      
      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    } catch (err: any) {
      console.error('Error sending message:', err);
      error = `Failed to send message: ${err.message || 'Unknown error'}`;
    }
  }
  
  // Function to mark messages as read
  function markMessagesAsRead() {
    if (!currentUser) return;
    
    messages.update(msgs => {
      const updatedMsgs = msgs.map(msg => {
        if (!msg.isRead && msg.sender !== currentUser?.username) {
          // Update in Gun.js
          messagesRef.get(msg.id).put({ isRead: true });
          // Update locally
          return { ...msg, isRead: true };
        }
        return msg;
      });
      return updatedMsgs;
    });
    
    // Update last read timestamp
    lastReadTimestamp = Date.now();
    if (roomData && gun) {
      gun.get('chatRooms').get(roomId).get('members').get(currentUser.username).put({
        lastRead: lastReadTimestamp
      });
    }
    
    // Reset unread count
    unreadCount = 0;
  }
  
  // Function to handle scroll events
  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // Check if scrolled to bottom
    isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    
    // Mark messages as read when scrolled to bottom
    if (isAtBottom) {
      markMessagesAsRead();
    }
  }
  
  // Function to scroll to bottom
  function scrollToBottom() {
    if (messageListElement) {
      messageListElement.scrollTop = messageListElement.scrollHeight;
      isAtBottom = true;
      markMessagesAsRead();
    }
  }
  
  // Function to count active users
  function countActiveUsers() {
    if (!roomData || !roomData.members) return 0;
    
    return Object.values(roomData.members).filter(member => member.active).length;
  }
  
  // Initialize Gun.js and load messages
  function initChat() {
    console.log('Initializing chat, attempt:', initRetries + 1);
    
    if (initRetries >= maxRetries) {
      error = 'Failed to initialize chat after multiple attempts. Please reload the page.';
      isLoading = false;
      return;
    }
    
    const { gun: gunInstance, user$ } = getGun();
    gun = gunInstance;
    
    if (!gun || !user$) {
      error = 'Failed to initialize chat. Please try again.';
      isLoading = false;
      
      // Retry initialization after a delay
      initRetries++;
      setTimeout(initChat, 2000);
      return;
    }
    
    if (!user$.is) {
      console.log('User not authenticated in Gun.js');
      error = 'You must be logged in to send messages';
      isLoading = false;
      return;
    }
    
    console.log('Gun initialized, loading chat room:', roomId);
    
    // Get room data
    gun.get('chatRooms').get(roomId).once((room: ChatRoom) => {
      if (room) {
        console.log('Room data loaded:', room);
        roomData = room;
        
        // Update active users count
        activeUsers = countActiveUsers();
        
        // Set up listener for room data changes to update active users
        gun.get('chatRooms').get(roomId).on((updatedRoom: ChatRoom) => {
          if (updatedRoom && updatedRoom.members) {
            roomData = updatedRoom;
            activeUsers = countActiveUsers();
          }
        });
        
        // Get messages reference
        messagesRef = gun.get('chatMessages').get(roomId);
        
        // Subscribe to messages
        messagesRef.map().on((msg: Message, id: string) => {
          if (!msg || !id) return;
          
          // Add ID to message if not present
          if (!msg.id) {
            msg.id = id;
            messagesRef.get(id).put({ id });
          }
          
          // Update messages store
          messages.update(msgs => {
            // Check if message already exists
            const existingIndex = msgs.findIndex(m => m.id === id);
            
            if (existingIndex >= 0) {
              // Update existing message
              msgs[existingIndex] = { ...msgs[existingIndex], ...msg };
              return [...msgs];
            } else {
              // Add new message
              const newMsgs = [...msgs, msg].sort((a, b) => a.timestamp - b.timestamp);
              
              // Increment unread count if not at bottom and not from current user
              if (!isAtBottom && msg.sender !== currentUser?.username && !msg.isRead) {
                unreadCount++;
              }
              
              // If at bottom, mark as read
              if (isAtBottom && msg.sender !== currentUser?.username && !msg.isRead) {
                setTimeout(() => {
                  messagesRef.get(id).put({ isRead: true });
                }, 500);
              }
              
              return newMsgs;
            }
          });
        });
        
        // Mark user as active in room
        if (currentUser) {
          gun.get('chatRooms').get(roomId).get('members').get(currentUser.username).put({
            active: true,
            lastActive: Date.now()
          });
        }
        
        isLoading = false;
        error = '';
        
        // Scroll to bottom after messages load
        setTimeout(() => {
          scrollToBottom();
        }, 300);
      } else {
        // Create room if it doesn't exist
        console.log('Creating new room:', roomId);
        const newRoom: ChatRoom = {
          id: roomId,
          name: roomName,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          members: {},
          lastMessage: null
        };
        
        if (currentUser) {
          newRoom.members[currentUser.username] = {
            joined: Date.now(),
            lastRead: Date.now(),
            active: true,
            lastActive: Date.now()
          };
        }
        
        gun.get('chatRooms').get(roomId).put(newRoom);
        roomData = newRoom;
        activeUsers = 1; // Current user is active
        
        // Get messages reference
        messagesRef = gun.get('chatMessages').get(roomId);
        isLoading = false;
        error = '';
      }
    });
  }
  
  // Function to clean up when component is destroyed
  function cleanup() {
    // Mark user as inactive in room
    if (currentUser && roomData && gun) {
      gun.get('chatRooms').get(roomId).get('members').get(currentUser.username).put({
        active: false,
        lastActive: Date.now()
      });
    }
    
    // Unsubscribe from Gun.js listeners
    if (messagesRef) {
      messagesRef.off();
    }
  }
  
  onMount(() => {
    // Wait a bit to ensure auth is initialized
    setTimeout(() => {
      initChat();
    }, 500);
    
    // Set up interval to check for new messages
    const interval = setInterval(() => {
      if (!isAtBottom && unreadCount > 0) {
        // Notify user of new messages
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  });
  
  onDestroy(() => {
    unsubscribeUser();
    cleanup();
  });
</script>

<div class="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700/20">
  <!-- Chat header -->
  <div class="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/20">
    <div class="flex items-center">
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
      </div>
      <div class="ml-3">
        <h2 class="text-lg font-semibold text-white">{roomName}</h2>
        {#if roomData && roomData.members}
          <p class="text-xs text-slate-400">
            {activeUsers} active
          </p>
        {/if}
      </div>
    </div>
    
    <div class="flex items-center">
      <button 
        class="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 focus:outline-none"
        aria-label="Room information"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
  
  <!-- Chat messages -->
  <div 
    class="flex-1 overflow-y-auto p-4 space-y-4"
    bind:this={messageListElement}
    on:scroll={handleScroll}
  >
    {#if isLoading}
      <div class="flex justify-center items-center h-full">
        <div class="animate-pulse flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-blue-500/20"></div>
          <div class="mt-2 text-slate-400 text-sm">Loading messages...</div>
        </div>
      </div>
    {:else if error}
      <div class="flex justify-center items-center h-full">
        <div class="bg-red-500/20 text-red-300 p-4 rounded-lg max-w-md text-center">
          <p>{error}</p>
          <button 
            class="mt-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-md text-sm font-medium"
            on:click={() => { error = ''; initRetries = 0; initChat(); }}
          >
            Try Again
          </button>
        </div>
      </div>
    {:else}
      <MessageList 
        messages={$messages} 
        currentUser={currentUser?.username || ''} 
      />
      
      {#if !isAtBottom && unreadCount > 0}
        <button 
          in:fade={{ duration: 200 }}
          out:fade={{ duration: 200 }}
          class="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer"
          on:click={scrollToBottom}
          on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToBottom(); }}
          aria-label="Scroll to bottom"
        >
          <div class="flex items-center">
            <span class="mr-2">{unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      {/if}
    {/if}
  </div>
  
  <!-- Message input -->
  <div class="p-4 bg-slate-800/30 border-t border-slate-700/20">
    <MessageInput 
      on:sendMessage={handleSendMessage} 
      disabled={!currentUser || isLoading || !!error} 
    />
    
    {#if !currentUser}
      <div class="mt-2 text-center text-red-300 text-sm">
        You must be logged in to send messages
      </div>
    {/if}
  </div>
</div>

<style>
  /* Custom scrollbar for Webkit browsers */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.1);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.2);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.3);
  }
</style>