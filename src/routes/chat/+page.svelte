<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { user } from '../../lib/auth-store';
  import ChatSidebar from './chat-sidebar.svelte';
  import ChatHeader from './chat-header.svelte';
  import MessageList from './message-list.svelte';
  import MessageInput from './message-input.svelte';
  import ProfilePanel from './profile-panel.svelte';
  import { gunInstance, currentUser, gunInitialized } from '../../lib/gun-store';
  import { currentChat, chats, activeContacts } from './chat-store';
  import SearchPanel from './search-panel.svelte';
  import type { GunUser } from './gun-types';
  
  // View state
  let showSidebar = true;
  let showProfile = false;
  let showSearch = false;
  let mounted = false;
  let error: string | null = null;

  // Cleanup function for Gun subscriptions
  let cleanupFunctions: (() => void)[] = [];
  
  // Initialize chat when authenticated
  onMount(async () => {
    // Redirect if not authenticated

    // Wait for Gun to be initialized if needed
    if (!$gunInitialized) {
      const unsubscribe = gunInitialized.subscribe(value => {
        if (value) {
          initializeChat();
          unsubscribe();
        }
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (!$gunInitialized) {
          error = "Failed to initialize Gun.js. Please reload the page.";
          unsubscribe();
        }
      }, 5000);
    } else {
      initializeChat();
    }
  });
  
  // Function to initialize chat once Gun is ready
  async function initializeChat() {
    try {
      const gun = $gunInstance;
      if (!gun) {
        error = "Gun instance is not available. Please refresh the page.";
        console.error('Gun instance is null');
        return;
      }
      
      console.log('Gun instance available, initializing chat...');
      const user = gun.user().recall({ sessionStorage: true });
      
      // Set current user reference
      currentUser.set(user);

      // Load user's chats
      const loadChats = () => {
        user.get('chats').map().on((chat: any, chatId?: string) => {
          if (!chatId) return; // Ensure chatId is defined
          if (chat) {
            chats.update(chatList => {
              const exists = chatList.find(c => c.id === chatId);
              if (!exists) {
                return [...chatList, {
                  id: chatId,
                  type: chat.type || 'private',
                  name: chat.name || 'Unknown',
                  lastMessage: chat.lastMessage || '',
                  timestamp: chat.timestamp || Date.now(),
                  unread: chat.unread || 0
                }];
              }
              return chatList;
            });
          }
        });
      };

      // Load user's contacts
      const loadContacts = () => {
        user.get('contacts').map().on((contact: any, pubKey?: string) => {
          if (contact && pubKey) {
            activeContacts.update(contacts => {
              const exists = contacts.find(c => c.publicKey === pubKey);
              if (!exists) {
                return [...contacts, {
                  publicKey: pubKey,
                  username: contact.username || 'Unknown',
                  alias: contact.alias || contact.username || 'Unknown',
                  online: false,
                  lastSeen: contact.lastSeen || null
                }];
              }
              return contacts;
            });
          }
        });
      };

      // Start loading data
      loadChats();
      loadContacts();

      // Add cleanup functions
      cleanupFunctions.push(() => {
        user.get('chats').map().off();
        user.get('contacts').map().off();
      });

      mounted = true;
      console.log('Chat initialized successfully');
    } catch (e) {
      const err = e as Error;
      error = err.message || "An error occurred initializing the chat";
      console.error('Error initializing chat:', e);
    }
  }

  onDestroy(() => {
    // Clean up all subscriptions
    cleanupFunctions.forEach(cleanup => cleanup());
  });

  // Handle toggles
  function toggleSidebar() {
    showSidebar = !showSidebar;
  }

  function toggleProfile() {
    showProfile = !showProfile;
    if (showProfile) showSearch = false;
  }

  function toggleSearch() {
    showSearch = !showSearch;
    if (showSearch) showProfile = false;
  }
</script>

<svelte:head>
  <title>Bluebox Chat</title>
</svelte:head>

<div class="flex h-screen bg-slate-900 text-white">
  {#if error}
    <!-- Error state -->
    <div class="w-full h-screen flex items-center justify-center bg-slate-900">
      <div class="flex flex-col items-center p-6 bg-slate-800 rounded-lg shadow-lg max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p class="text-center text-gray-300 mb-4">{error}</p>
        <button 
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          on:click={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    </div>
  {:else if !mounted}
    <!-- Loading state -->
    <div class="w-full h-screen flex items-center justify-center bg-slate-900">
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p class="mt-4 text-lg text-blue-400">Loading secure chat...</p>
        <p class="text-sm text-gray-400 mt-2">Initializing encryption...</p>
      </div>
    </div>
  {:else}
    <!-- Sidebar (Contact list and chats) -->
    <div class="relative w-full md:w-[320px] flex-shrink-0 overflow-hidden {showSidebar ? '' : 'hidden md:block'}">
      <ChatSidebar 
        on:toggle-profile={toggleProfile} 
        on:toggle-search={toggleSearch} 
      />
    </div>

    <!-- Main chat area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Chat header -->
      <ChatHeader 
        on:toggle-sidebar={toggleSidebar} 
        showSidebar={showSidebar} 
      />

      <!-- Messages container -->
      <div class="flex-1 overflow-hidden relative">
        <!-- Message list -->
        <MessageList chatId={$currentChat?.id} />

        <!-- Profile panel (slide in from right) -->
        {#if showProfile}
          <div 
            in:fly={{ x: 300, duration: 300 }} 
            out:fly={{ x: 300, duration: 300 }}
            class="absolute inset-y-0 right-0 w-full sm:w-80 bg-slate-800 shadow-lg z-10"
          >
            <ProfilePanel on:close={() => (showProfile = false)} />
          </div>
        {/if}

        <!-- Search panel (slide in from right) -->
        {#if showSearch}
          <div 
            in:fly={{ x: 300, duration: 300 }} 
            out:fly={{ x: 300, duration: 300 }}
            class="absolute inset-y-0 right-0 w-full sm:w-80 bg-slate-800 shadow-lg z-10"
          >
            <SearchPanel on:close={() => (showSearch = false)} />
          </div>
        {/if}
      </div>

      <!-- Message input -->
      <MessageInput chatId={$currentChat?.id} />
    </div>
  {/if}
</div>

