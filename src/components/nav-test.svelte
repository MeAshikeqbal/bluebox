<script lang="ts">
    import { onMount } from 'svelte';
    import { user } from '../lib/auth-store';
    import LogoutButton from './logout-button.svelte';
    
    let currentUser: { username: string; email: string } | null = null;
    
    // Subscribe to user store
    const unsubscribe = user.subscribe(value => {
      currentUser = value;
    });
    
    onMount(() => {
      return () => {
        unsubscribe();
      };
    });
  </script>
  
  <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span class="ml-2 text-xl font-bold text-white">Bluebox</span>
          </div>
        </div>
        
        <div class="flex items-center">
          {#if currentUser}
            <div class="mr-4 text-sm text-gray-300">
              <span class="font-medium">{currentUser.username}</span>
            </div>
            <LogoutButton />
          {:else}
            <a 
              href="/login" 
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign in
            </a>
            <a 
              href="/signup" 
              class="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign up
            </a>
          {/if}
        </div>
      </div>
    </div>
  </nav>