<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { user } from '$lib/auth-store';
  import { currentUser } from '$lib/gun-store';
  
  const dispatch = createEventDispatcher();
  
  let username = $user?.username || '';
  let status = '';
  let editing = false;
  let avatarUrl = '';
  
  function handleClose() {
    dispatch('close');
  }
  
  function startEditing() {
    editing = true;
  }
  
  function saveProfile() {
    if (!$currentUser) return;
    
    try {
      // Update profile in Gun.js
      $currentUser.get('profile').put({
        status,
        lastUpdated: Date.now()
      });
      
      editing = false;
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }
  
  function logout() {
    if (!$currentUser) return;
    
    try {
      // Gun.js logout
      $currentUser.leave();
      
      // Clear local auth store
      user.set(null);
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
</script>

<div class="h-full flex flex-col bg-slate-800">
  <!-- Header -->
  <div class="p-4 border-b border-slate-700 flex items-center justify-between">
    <h2 class="text-lg font-semibold">Profile</h2>
    <button 
      class="p-2 rounded-full hover:bg-slate-700"
      on:click={handleClose}
      aria-label="Close profile"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
  
  <!-- Profile content -->
  <div class="flex-1 overflow-y-auto p-4">
    <!-- Avatar and name -->
    <div class="flex flex-col items-center mb-6 pt-4">
      <div class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold mb-4">
        {username.charAt(0).toUpperCase()}
      </div>
      <h3 class="text-xl font-semibold">{username}</h3>
    </div>
    
    <!-- Profile details -->
    <div class="space-y-4">
      {#if editing}
        <!-- Edit mode -->
        <div>
          <label for="status-input" class="block text-sm text-gray-400 mb-1">Status</label>
          <input 
            id="status-input"
            type="text" 
            bind:value={status} 
            class="w-full p-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div class="flex justify-end space-x-2 mt-4">
          <button 
            class="px-4 py-2 rounded-lg bg-slate-700 text-white"
            on:click={() => editing = false}
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            on:click={saveProfile}
          >
            Save
          </button>
        </div>
      {:else}
        <!-- View mode -->
        <div class="bg-slate-700/50 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="text-sm text-gray-400">Status</h4>
            <button 
              class="text-blue-400 text-sm"
              on:click={startEditing}
            >
              Edit
            </button>
          </div>
          <p class="text-white">{status || 'No status set'}</p>
        </div>
        
        <!-- Security section -->
        <div class="mt-6">
          <h4 class="text-sm text-gray-400 mb-2">Security</h4>
          <div class="bg-slate-700/50 rounded-lg p-4 mb-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-white">End-to-End Encryption</span>
                <p class="text-xs text-gray-400">All your messages are encrypted</p>
              </div>
              <div class="bg-green-500 rounded-full w-4 h-4"></div>
            </div>
          </div>
          
          <div class="bg-slate-700/50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-white">Two-Factor Authentication</span>
                <p class="text-xs text-gray-400">Add an extra layer of security</p>
              </div>
              <button class="text-blue-400 text-sm">
                Enable
              </button>
            </div>
          </div>
        </div>
        
        <!-- Danger zone -->
        <div class="mt-6">
          <h4 class="text-sm text-gray-400 mb-2">Account</h4>
          <button 
            class="w-full p-3 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30"
            on:click={logout}
          >
            Logout
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

