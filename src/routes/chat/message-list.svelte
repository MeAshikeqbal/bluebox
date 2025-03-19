<script lang="ts">
  import MessageItem from './message-item.svelte';
  import type { Message } from './types';
  import { createEventDispatcher } from 'svelte';

  export let messages: Message[] = [];
  export let currentUser: string = '';
  export let groupedThreshold: number = 60; // Time in seconds to group messages
  
  const dispatch = createEventDispatcher();

  function isGroupedWithPrevious(index: number): boolean {
    if (index === 0) return false;

    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];

    if (!currentMessage || !previousMessage) return false;
    
    // Calculate time difference in seconds
    const timeDifference = Math.abs((currentMessage.timestamp - previousMessage.timestamp) / 1000);

    return currentMessage.sender === previousMessage.sender && timeDifference < groupedThreshold;
  }

  function handleAttachmentPreview(event: CustomEvent<string>) {
    const url = event.detail;
    console.log('Attachment preview requested:', url);
    dispatch('previewAttachment', url);
  }
</script>

<div class="message-list">
  {#each messages as message, index}
    {@const isGrouped = isGroupedWithPrevious(index)}
    <MessageItem 
      {message} 
      isCurrentUser={message.sender === currentUser} 
      {isGrouped}
      on:previewAttachment={handleAttachmentPreview}
    />
  {/each}
</div>

<style>
  .message-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }
</style>

