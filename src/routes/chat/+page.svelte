<script lang="ts">
  import { onMount } from 'svelte';
  import { getGun, user, initGun } from '$lib/auth-store';
  import ChatWindow from './chat-window.svelte';
  import type { ChatRoom } from './types';
  
  // Local state
  let rooms: ChatRoom[] = [];
  let selectedRoomId: string = 'general';
  let isLoading: boolean = true;
  let error: string = '';
  
  // Initialize Gun.js and load rooms
  function loadRooms() {
    const { gun } = getGun();
    
    if (!gun) {
      isLoading = false;
      error = 'Failed to initialize Gun.js';
      return;
    }
    
    // Subscribe to chat rooms
    gun.get('chatRooms').map().on((room: ChatRoom, id: string) => {
      if (!room || !id) return;
      
      // Update rooms array
      rooms = rooms.filter(r => r.id !== id);
      rooms = [...rooms, { ...room, id }].sort((a, b) => b.updatedAt - a.updatedAt);
      
      isLoading = false;
    });
  }
  
  // Select a room
  function selectRoom(roomId: string) {
    selectedRoomId = roomId;
  }
  
  // Create a default room if none exists
  function createDefaultRoom() {
    if (rooms.length === 0 && !isLoading) {
      const { gun } = getGun();
      
      if (gun && $user) {
        const defaultRoom: ChatRoom = {
          id: 'general',
          name: 'General Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          members: {
            [$user.username]: {
              joined: Date.now(),
              lastRead: Date.now(),
              active: true,
              lastActive: Date.now()
            }
          },
          lastMessage: null
        };
        
        gun.get('chatRooms').get('general').put(defaultRoom);
      }
    }
  }
  
  // Watch for user changes to handle authentication
  $: if ($user) {
    // Make sure Gun is initialized when user is available
    if (rooms.length === 0 && !isLoading) {
      setTimeout(createDefaultRoom, 1000);
    }
  }
  
  onMount(() => {
    // Initialize Gun first
    initGun();
    
    // Then load rooms after a short delay to ensure auth is ready
    setTimeout(() => {
      loadRooms();
      
      // Create a default room if none exists after loading
      setTimeout(createDefaultRoom, 1000);
    }, 500);
  });
</script>

<div class="flex h-screen bg-slate-900 text-slate-200">
  <!-- Sidebar -->
  <div class="w-64 border-r border-slate-700/20 flex flex-col">
    <div class="p-4 border-b border-slate-700/20">
      <h1 class="text-xl font-bold text-white">Bluebox Chat</h1>
    </div>
    
    <!-- Room list -->
    <div class="flex-1 overflow-y-auto p-2">
      {#if isLoading}
        <div class="flex justify-center items-center h-32">
          <div class="animate-pulse flex flex-col items-center">
            <div class="w-8 h-8 rounded-full bg-blue-500/20"></div>
            <div class="mt-2 text-slate-400 text-sm">Loading rooms...</div>
          </div>
        </div>
      {:else if error}
        <div class="flex justify-center items-center h-32 text-red-300 text-center">
          <div>
            <p>{error}</p>
            <button 
              class="mt-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-md text-sm font-medium"
              on:click={() => { error = ''; isLoading = true; loadRooms(); }}
            >
              Try Again
            </button>
          </div>
        </div>
      {:else if rooms.length === 0}
        <div class="flex justify-center items-center h-32 text-slate-400 text-center">
          <div>
            <p>No chat rooms available</p>
            <button 
              class="mt-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-md text-sm font-medium text-blue-300"
              on:click={createDefaultRoom}
            >
              Create Room
            </button>
          </div>
        </div>
      {:else}
        <div class="space-y-1">
          {#each rooms as room}
            <button
              class={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedRoomId === room.id 
                  ? 'bg-blue-500/20 text-blue-100' 
                  : 'hover:bg-slate-800/70 text-slate-300'
              }`}
              on:click={() => selectRoom(room.id)}
            >
              <div class="flex items-center">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-sm">
                  {room.name.substring(0, 2).toUpperCase()}
                </div>
                <div class="ml-2 overflow-hidden">
                  <div class="font-medium truncate">{room.name}</div>
                  {#if room.lastMessage}
                    <div class="text-xs text-slate-400 truncate">
                      <span class="font-medium">{room.lastMessage.sender}:</span> {room.lastMessage.text}
                    </div>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- User info -->
    <div class="p-4 border-t border-slate-700/20">
      {#if $user}
        <div class="flex items-center">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            {$user.username.substring(0, 2).toUpperCase()}
          </div>
          <div class="ml-3 overflow-hidden">
            <div class="font-medium truncate">{$user.username}</div>
            <div class="text-xs text-slate-400 truncate">{$user.email}</div>
          </div>
        </div>
      {:else}
        <div class="text-center">
          <a href="/login" class="text-blue-400 hover:underline">Sign in</a>
          <span class="text-slate-500 mx-2">|</span>
          <a href="/signup" class="text-blue-400 hover:underline">Sign up</a>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Chat area -->
  <div class="flex-1 flex flex-col">
    {#if selectedRoomId}
      {@const selectedRoom = rooms.find(r => r.id === selectedRoomId)}
      <ChatWindow 
        roomId={selectedRoomId} 
        roomName={selectedRoom?.name || 'Chat'} 
      />
    {:else}
      <div class="flex-1 flex items-center justify-center text-slate-400">
        <div class="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-xl font-medium">Select a chat to start messaging</p>
          <p class="mt-2 text-sm">Choose a room from the sidebar</p>
        </div>
      </div>
    {/if}
  </div>
</div>