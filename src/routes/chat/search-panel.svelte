<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { searchResults, chatActions, isLoadingContacts } from './chat-store';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  let searchQuery = '';
  let searchTimeout: ReturnType<typeof setTimeout>;
  let debugMode = true; // Set to true to show debug information
  let errorMessage = '';
  let showError = false;

  function handleClose() {
    dispatch('close');
  }

  function handleSearch() {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
      if (searchQuery.length >= 3) {
        console.log(`Searching for: ${searchQuery}`);
        chatActions.searchUsers(searchQuery);
      }
    }, 500);
  }

  async function startChat(pubKey: string, username: string) {
    try {
      errorMessage = '';
      showError = false;
      
      console.log(`Starting chat with ${username} (${pubKey})`);
      await chatActions.createPrivateChat(pubKey, username);
      dispatch('close');
    } catch (error) {
      console.error('Failed to start chat:', error);
      errorMessage = error instanceof Error ? error.message : 'Failed to start chat';
      showError = true;
      setTimeout(() => { showError = false; }, 5000);
    }
  }
</script>

<div class="h-full flex flex-col bg-slate-800">
  <!-- Header -->
  <div class="p-4 border-b border-slate-700 flex items-center justify-between">
    <h2 class="text-lg font-semibold">Find Users</h2>
    <button 
      class="p-2 rounded-full hover:bg-slate-700"
      on:click={handleClose}
      aria-label="Close search"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <!-- Error message -->
  {#if showError}
    <div 
      class="mx-4 mt-4 p-2 bg-red-500/20 text-red-300 rounded-md text-sm"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
    >
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{errorMessage}</span>
      </div>
    </div>
  {/if}

  <!-- Search input -->
  <div class="p-4 border-b border-slate-700">
    <div class="relative">
      <input
        type="text"
        placeholder="Search by username (min 3 chars)"
        bind:value={searchQuery}
        on:input={handleSearch}
        class="w-full p-3 pl-10 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 absolute left-3 top-3.5 text-gray-400"
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

  <!-- Debug mode toggle -->
  {#if debugMode}
    <div class="px-4 py-2 bg-blue-500/20 text-blue-300 text-xs border-b border-slate-700">
      <div class="flex items-center justify-between">
        <span>Debug Mode</span>
        <button 
          class="px-2 py-1 text-xs rounded-md bg-blue-600/30 hover:bg-blue-600/50"
          on:click={() => debugMode = !debugMode}
        >
          Turn Off
        </button>
      </div>
      <div class="mt-1">
        <p>Search query: "{searchQuery}"</p>
        <p>Results: {$searchResults.length}</p>
        <p>Loading: {$isLoadingContacts ? 'Yes' : 'No'}</p>
      </div>
    </div>
  {/if}

  <!-- Search results -->
  <div class="flex-1 overflow-y-auto">
    {#if $isLoadingContacts}
      <div class="flex justify-center items-center h-32">
        <div class="w-8 h-8 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    {:else if searchQuery.length < 3}
      <div class="p-8 text-center text-gray-400">
        <p>Enter at least 3 characters to search</p>
      </div>
    {:else if $searchResults.length === 0}
      <div class="p-8 text-center text-gray-400">
        <p>No users found matching "{searchQuery}"</p>
        {#if debugMode}
          <div class="mt-4 p-3 bg-slate-700 rounded-lg text-left text-xs">
            <p class="text-yellow-300">Troubleshooting:</p>
            <ul class="list-disc pl-5 mt-1 space-y-1 text-gray-300">
              <li>Check if users are registered in the system</li>
              <li>Check browser console for errors</li>
              <li>Make sure Gun.js is properly initialized</li>
            </ul>
          </div>
        {/if}
      </div>
    {:else}
      <div class="p-2">
        {#each $searchResults as result}
          <div class="p-3 hover:bg-slate-700 rounded-lg cursor-pointer flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold mr-3">
                {result.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="font-medium">{result.username}</p>
                <p class="text-xs text-gray-400">
                  {result.online ? 'Online' : result.lastSeen ? `Last seen ${new Date(result.lastSeen).toLocaleDateString()}` : 'Offline'}
                </p>
                {#if debugMode}
                  <p class="text-xs text-blue-300 mt-1">PubKey: {result.publicKey.substring(0, 8)}...</p>
                {/if}
              </div>
            </div>
            <button
              class="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
              on:click={() => startChat(result.publicKey, result.username)}
            >
              Chat
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Create group chat button -->
  <div class="p-4 border-t border-slate-700">
    <button
      class="w-full p-3 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 flex items-center justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      Create Group Chat
    </button>
  </div>
</div>

