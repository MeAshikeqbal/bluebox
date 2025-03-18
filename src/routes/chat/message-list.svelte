<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import MessageItem from './message-item.svelte';
    import type { Message } from './types';
    
    // Props
    export let messages: Message[] = [];
    export let currentUser: string = '';
    
    // Local state
    let lastDate: string = '';
    let groupedMessages: { [key: string]: Message[] } = {};
    
    // Group messages by date
    $: {
      groupedMessages = {};
      messages.forEach(message => {
        const date = new Date(message.timestamp).toLocaleDateString();
        if (!groupedMessages[date]) {
          groupedMessages[date] = [];
        }
        groupedMessages[date].push(message);
      });
    }
    
    // Format date for display
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
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    }
    
    // Check if messages should be grouped
    function shouldGroupMessages(current: Message, previous: Message | null): boolean {
      if (!previous) return false;
      
      // Group if same sender and within 2 minutes
      return (
        current.sender === previous.sender && 
        current.timestamp - previous.timestamp < 2 * 60 * 1000
      );
    }
    
    afterUpdate(() => {
      // Any post-update logic can go here
    });
  </script>
  
  {#if messages.length === 0}
    <div class="flex flex-col items-center justify-center h-64 text-slate-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p class="text-center">No messages yet. Start the conversation!</p>
    </div>
  {:else}
    {#each Object.keys(groupedMessages) as date}
      <div class="relative py-2">
        <div class="flex items-center justify-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-700/30"></div>
          </div>
          <div class="relative px-4 bg-slate-900 text-xs font-medium text-slate-400">
            {formatDate(groupedMessages[date][0].timestamp)}
          </div>
        </div>
        
        <div class="mt-3 space-y-3">
          {#each groupedMessages[date] as message, i}
            {@const previousMessage = i > 0 ? groupedMessages[date][i - 1] : null}
            {@const isGrouped = shouldGroupMessages(message, previousMessage)}
            
            <div 
              in:fly={{ y: 20, duration: 300, delay: 50 * (i % 5) }}
              out:fade={{ duration: 200 }}
            >
              <MessageItem 
                {message} 
                isCurrentUser={message.sender === currentUser} 
                {isGrouped}
              />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  {/if}