<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { getGun, logout, authLoading } from '../lib/auth-store';
    
    let isLoading = false;
    let mounted = false;
    
    // Subscribe to authLoading to update our local state
    const unsubscribe = authLoading.subscribe(value => {
      isLoading = value;
    });
    
    function handleLogout(): void {
      if (!mounted) return;
      
      isLoading = true;
      logout();
    }
    
    onMount(() => {
      mounted = true;
      
      // Initialize Gun.js if not already initialized
      getGun();
      
      return () => {
        mounted = false;
      };
    });
    
    onDestroy(() => {
      unsubscribe();
    });
  </script>
  
  <button 
    on:click={handleLogout}
    class="flex items-center rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
    disabled={isLoading}
    type="button"
  >
    {#if isLoading}
      <svg
        class="mr-2 h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Logging out...
    {:else}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="mr-2 h-4 w-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
        />
      </svg>
      Logout
    {/if}
  </button>