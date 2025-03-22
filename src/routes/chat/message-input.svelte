<script lang="ts">
  import { chatActions } from './chat-store';
  import { fade } from 'svelte/transition';

  export let chatId: string | undefined;

  let message = '';
  let isAttaching = false;
  let isSending = false;
  let attachmentMenu = false;
  let errorMessage = '';
  let showError = false;

  // Send message
  async function sendMessage() {
    if (!message.trim() || !chatId) return;
    
    try {
      errorMessage = '';
      showError = false;
      isSending = true;
      
      console.log("Sending message to chat:", chatId);
      const success = await chatActions.sendMessage(chatId, message.trim());
      
      if (success) {
        message = '';
      } else {
        errorMessage = 'Failed to send message. Please try again.';
        showError = true;
        setTimeout(() => { showError = false; }, 5000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error sending message';
      showError = true;
      setTimeout(() => { showError = false; }, 5000);
    } finally {
      isSending = false;
    }
  }

  // Handle keydown events (Enter to send)
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function toggleAttachmentMenu() {
    attachmentMenu = !attachmentMenu;
  }
</script>

<div class="p-4 border-t border-slate-700 bg-slate-800">
  {#if chatId}
    <!-- Error message -->
    {#if showError}
      <div 
        class="mb-3 p-2 bg-red-500/20 text-red-300 rounded-md text-sm"
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
  
    <!-- Message composer -->
    <div class="flex items-end space-x-2">
      <!-- Attachment button -->
      <div class="relative">
        <button 
          class="p-2 rounded-full hover:bg-slate-700 text-gray-300"
          on:click={toggleAttachmentMenu}
          aria-label="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
        {#if attachmentMenu}
          <div 
            class="absolute bottom-full left-0 mb-2 p-2 bg-slate-700 rounded-lg shadow-lg z-10 flex flex-col gap-2 w-40"
            on:mouseleave={() => (attachmentMenu = false)}
          >
            <button class="flex items-center text-sm text-gray-300 hover:text-white p-2 hover:bg-slate-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Image
            </button>
            <button class="flex items-center text-sm text-gray-300 hover:text-white p-2 hover:bg-slate-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
              </svg>
              Audio
            </button>
            <button class="flex items-center text-sm text-gray-300 hover:text-white p-2 hover:bg-slate-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Document
            </button>
          </div>
        {/if}
      </div>
      
      <!-- Message input -->
      <div class="flex-1 relative">
        <textarea
          rows="1"
          placeholder="Type a message..."
          bind:value={message}
          on:keydown={handleKeydown}
          class="w-full resize-none rounded-2xl bg-slate-700 text-white placeholder-gray-400 px-4 py-3 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500 max-h-32"
        ></textarea>
        
        <!-- Emoji button -->
        <button 
          class="absolute right-3 bottom-3 text-gray-400 hover:text-gray-300"
          aria-label="Add emoji"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      <!-- Send button -->
      <button
        class="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={sendMessage}
        disabled={!message.trim() || isSending}
        aria-label="Send message"
      >
        {#if isSending}
          <div class="w-6 h-6 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        {/if}
      </button>
    </div>
  {:else}
    <!-- No active chat -->
    <div class="flex justify-center">
      <p class="text-sm text-gray-400">Select a chat to start messaging</p>
    </div>
  {/if}
</div>

