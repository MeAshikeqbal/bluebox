<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { fly } from 'svelte/transition';
  import { sortedMessages, chatActions, isLoadingMessages } from './chat-store';
  import { user } from '$lib/auth-store';
  import { currentUser } from '$lib/gun-store';
  
  export let chatId: string | undefined;
  
  let messagesContainer: HTMLElement;
  let previousChatId: string | undefined;
  
  // Format timestamp
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Format date for message groups
  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }
  
  // Check if message is from current user
  function isOwnMessage(senderPubKey: string): boolean {
    return $currentUser?.is?.pub === senderPubKey;
  }
  
  // Scroll to bottom of messages
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  
  // Load messages when chat changes
  $: if (chatId && chatId !== previousChatId) {
    chatActions.loadMessages(chatId);
    previousChatId = chatId;
  }
  
  // Auto-scroll when new messages arrive
  afterUpdate(() => {
    scrollToBottom();
  });
  
  onMount(() => {
    if (chatId) {
      chatActions.loadMessages(chatId);
    }
  });
</script>

<div 
  class="h-full overflow-y-auto p-4 space-y-4"
  bind:this={messagesContainer}
>
  {#if !chatId}
    <!-- No chat selected -->
    <div class="h-full flex flex-col items-center justify-center text-center p-8">
      <div class="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-300 mb-2">Welcome to Bluebox Chat</h3>
      <p class="text-gray-400 max-w-md">
        Select a conversation from the sidebar or start a new secure chat.
      </p>
    </div>
  {:else if $isLoadingMessages}
    <!-- Loading messages -->
    <div class="h-full flex items-center justify-center">
      <div class="w-10 h-10 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
    </div>
  {:else if $sortedMessages.length === 0}
    <!-- No messages -->
    <div class="h-full flex flex-col items-center justify-center text-center p-8">
      <div class="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-300 mb-2">No messages yet</h3>
      <p class="text-gray-400 max-w-md">
        Start the conversation by sending a message below.
      </p>
    </div>
  {:else}
    <!-- Group messages by date -->
    {#each $sortedMessages as message, i}
      <!-- Date separator -->
      {#if i === 0 || formatDate(message.timestamp) !== formatDate($sortedMessages[i-1].timestamp)}
        <div class="flex justify-center my-4">
          <div class="px-3 py-1 rounded-full bg-slate-700/50 text-xs text-gray-400">
            {formatDate(message.timestamp)}
          </div>
        </div>
      {/if}
      
      <!-- Message bubble -->
      <div 
        class={`flex ${isOwnMessage(message.sender) ? 'justify-end' : 'justify-start'}`}
        in:fly={{ y: 20, duration: 300 }}
      >
        <div 
          class={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isOwnMessage(message.sender) 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-slate-700 text-white rounded-tl-none'
          }`}
        >
          <div class="text-sm">
            {message.content}
          </div>
          <div class={`text-xs mt-1 flex items-center ${isOwnMessage(message.sender) ? 'text-blue-200' : 'text-gray-400'}`}>
            <span>{formatTime(message.timestamp)}</span>
            
            {#if isOwnMessage(message.sender)}
              <span class="ml-1">
                {#if message.read}
                  <!-- Double check mark for read -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                {:else if message.delivered}
                  <!-- Single check mark for delivered -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                {/if}
              </span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>

