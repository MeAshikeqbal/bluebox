<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { currentChat } from './chat-store';
  
  export let showSidebar: boolean = true;
  
  const dispatch = createEventDispatcher();
  
  function toggleSidebar() {
    dispatch('toggle-sidebar');
  }
</script>

<div class="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
  <!-- Left side: menu toggle and chat info -->
  <div class="flex items-center">
    <!-- Mobile menu toggle -->
    <button 
      class="mr-3 p-2 rounded-lg hover:bg-slate-700 md:hidden"
      on:click={toggleSidebar}
      aria-label={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    
    {#if $currentChat}
      <!-- Chat avatar -->
      <div class="mr-3">
        {#if $currentChat.type === 'group'}
          <div class="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold">
            {$currentChat.name.slice(0, 2).toUpperCase()}
          </div>
        {:else}
          <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {$currentChat.name.slice(0, 1).toUpperCase()}
          </div>
        {/if}
      </div>
      
      <!-- Chat info -->
      <div>
        <h2 class="text-lg font-semibold">{$currentChat.name}</h2>
        <p class="text-xs text-gray-400">
          {$currentChat.type === 'group' ? 'Group' : 'Online'}
        </p>
      </div>
    {:else}
      <div>
        <h2 class="text-lg font-semibold">Bluebox Chat</h2>
        <p class="text-xs text-gray-400">Select a conversation to start messaging</p>
      </div>
    {/if}
  </div>
  
  <!-- Right side: actions -->
  {#if $currentChat}
    <div class="flex items-center space-x-3">
      <!-- Search in conversation -->
      <button class="p-2 rounded-full hover:bg-slate-700 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      
      <!-- Call button -->
      <button class="p-2 rounded-full hover:bg-slate-700 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>
      
      <!-- More options -->
      <button class="p-2 rounded-full hover:bg-slate-700 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  {/if}
</div>

