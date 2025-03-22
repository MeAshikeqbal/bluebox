<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { sortedChats } from './chat-store';
  import { currentChat } from './chat-store';
  import { user } from '$lib/auth-store';
  import type { Chat } from './gun-types';
  
  const dispatch = createEventDispatcher();
  
  let activeTab: 'chats' | 'contacts' = 'chats';
  
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within the last week, show day of week
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  function selectChat(chat: Chat) {
    currentChat.set(chat);
  }
  
  function showProfile() {
    dispatch('toggle-profile');
  }
  
  function showSearch() {
    dispatch('toggle-search');
  }
</script>

<div class="flex flex-col h-full bg-slate-800 border-r border-slate-700">
  <!-- User profile header -->
  <div class="p-4 border-b border-slate-700">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <div class="w-10 h-10 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
            {#if $user?.username}
              <span class="text-lg font-semibold">{$user.username.charAt(0).toUpperCase()}</span>
            {:else}
              <span class="text-lg font-semibold">?</span>
            {/if}
          </div>
          <div class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-800"></div>
        </div>
        <div>
          <h2 class="text-base font-semibold">{$user?.username || 'User'}</h2>
          <p class="text-xs text-gray-400">Online</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Settings button -->
        <button 
          class="p-2 rounded-full hover:bg-slate-700 text-gray-300"
          on:click={showProfile}
          aria-label="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        <!-- New chat button -->
        <button 
          class="p-2 rounded-full hover:bg-slate-700 text-gray-300"
          on:click={showSearch}
          aria-label="New chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="flex border-b border-slate-700">
    <button
      class={`flex-1 py-3 text-sm font-medium ${activeTab === 'chats' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
      on:click={() => (activeTab = 'chats')}
    >
      Chats
    </button>
    <button
      class={`flex-1 py-3 text-sm font-medium ${activeTab === 'contacts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
      on:click={() => (activeTab = 'contacts')}
    >
      Contacts
    </button>
  </div>

  <!-- Search input -->
  <div class="p-4">
    <div class="relative">
      <input
        type="text"
        placeholder="Search"
        class="w-full p-2 pl-10 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  </div>

  <!-- Chat list -->
  {#if activeTab === 'chats'}
    <div class="flex-1 overflow-y-auto">
      <div class="space-y-1 p-2">
        {#if $sortedChats.length === 0}
          <div class="text-center py-8 text-gray-400">
            <p>No chats yet</p>
            <button 
              class="mt-2 text-blue-400 text-sm"
              on:click={showSearch}
            >
              Start a new chat
            </button>
          </div>
        {:else}
          {#each $sortedChats as chat (chat.id)}
            <div
              class={`flex items-center p-3 rounded-lg cursor-pointer transition-colors 
                ${$currentChat?.id === chat.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
              on:click={() => selectChat(chat)}
              transition:fade={{ duration: 200 }}
            >
              <div class="relative mr-3">
                {#if chat.type === 'group'}
                  <div class="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {chat.name.slice(0, 2).toUpperCase()}
                  </div>
                {:else}
                  <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {chat.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-800"></div>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between">
                  <h3 class="text-sm font-medium truncate">{chat.name}</h3>
                  <span class="text-xs text-gray-400">{formatTime(chat.timestamp)}</span>
                </div>
                <div class="flex justify-between items-center">
                  <p class="text-xs text-gray-400 truncate">{chat.lastMessage || 'No messages yet'}</p>
                  {#if chat.unread > 0}
                    <span class="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {chat.unread}
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {:else}
    <!-- Contacts list here -->
    <div class="flex-1 overflow-y-auto">
      <!-- Content for contacts tab -->
    </div>
  {/if}
</div>

