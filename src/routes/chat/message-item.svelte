<script lang="ts">
  import { onMount } from 'svelte';
  import type { Message } from './types';
  
  // Props
  export let message: Message;
  export let isCurrentUser: boolean = false;
  export let isGrouped: boolean = false;
  
  // Local state
  let imageLoaded: boolean = false;
  let imageError: boolean = false;
  
  // Format timestamp
  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  // Generate avatar color based on username
  function generateAvatarColor(username: string): string {
    const colors = [
      'bg-blue-500/20 text-blue-400',
      'bg-purple-500/20 text-purple-400',
      'bg-green-500/20 text-green-400',
      'bg-pink-500/20 text-pink-400',
      'bg-yellow-500/20 text-yellow-400',
      'bg-indigo-500/20 text-indigo-400',
      'bg-red-500/20 text-red-400',
      'bg-orange-500/20 text-orange-400'
    ];
    
    // Simple hash function to get consistent color for a username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
  
  // Get initials from username
  function getInitials(username: string): string {
    if (!username) return '?';
    
    const parts = username.split(/[^a-zA-Z0-9]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    return username.substring(0, 2).toUpperCase();
  }
  
  // Handle image load
  function handleImageLoad() {
    imageLoaded = true;
  }
  
  // Handle image error
  function handleImageError() {
    imageError = true;
  }
  
  // Convert attachments object to array for display
  function getAttachmentsArray(attachments: { [key: string]: string } | undefined): string[] {
    if (!attachments) return [];
    return Object.values(attachments);
  }
  
  // Check if message has image attachments
  $: attachmentsArray = getAttachmentsArray(message.attachments);
  
  $: hasImages = attachmentsArray.some(url => 
    url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
  );
  
  // Check if message has other attachments
  $: hasOtherAttachments = attachmentsArray.some(url => 
    !url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
  );
  
  // Avatar color
  $: avatarColor = generateAvatarColor(message.sender);
</script>

<div class={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
  {#if !isCurrentUser && !isGrouped}
    <div class="flex-shrink-0 mr-3">
      <div class={`flex items-center justify-center w-8 h-8 rounded-full ${avatarColor}`}>
        {getInitials(message.sender)}
      </div>
    </div>
  {:else if !isCurrentUser && isGrouped}
    <div class="flex-shrink-0 mr-3 w-8"></div>
  {/if}
  
  <div class={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
    {#if !isGrouped && !isCurrentUser}
      <div class="text-xs text-slate-400 mb-1 ml-1">
        {message.sender}
      </div>
    {/if}
    
    <div class={`rounded-lg px-4 py-2 shadow-sm ${
      isCurrentUser 
        ? 'bg-blue-500/20 text-blue-50' 
        : 'bg-slate-800/80 text-slate-200'
    }`}>
      {#if message.text}
        <div class="whitespace-pre-wrap break-words">{message.text}</div>
      {/if}
      
      {#if hasImages}
        <div class={`${message.text ? 'mt-2' : ''} grid gap-2 ${
          attachmentsArray.filter(url => url.match(/\.(jpeg|jpg|gif|png|webp)$/i)).length > 1 ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {#each attachmentsArray.filter(url => url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) as imageUrl, i}
            <div class="relative rounded-md overflow-hidden bg-slate-700/30">
              {#if !imageLoaded && !imageError}
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              {/if}
              
              <img 
                src={imageUrl || "/placeholder.svg"} 
                alt="Attachment" 
                class="w-full h-auto max-h-60 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                on:load={handleImageLoad}
                on:error={handleImageError}
                style={imageLoaded ? '' : 'opacity: 0;'}
              />
              
              {#if imageError}
                <div class="flex items-center justify-center h-32 bg-slate-700/30 text-slate-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Failed to load image
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      
      {#if hasOtherAttachments}
        <div class={`${message.text || hasImages ? 'mt-2' : ''} space-y-2`}>
          {#each attachmentsArray.filter(url => !url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) as fileUrl}
            <div class="flex items-center p-2 rounded bg-slate-700/30 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
              </svg>
              <span class="truncate max-w-xs">{fileUrl.split('/').pop()}</span>
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="ml-2 text-blue-400 hover:text-blue-300"
                download
                aria-label="Download attachment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    
    <div class="flex items-center mt-1 text-xs text-slate-500">
      <span>{formatTime(message.timestamp)}</span>
      
      {#if isCurrentUser}
        <span class="ml-2 flex items-center">
          {#if message.isRead}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.647 2.646a1 1 0 001.414-1.414L10.414 8H12a1 1 0 10 0-2h-2z" clip-rule="evenodd" />
            </svg>
          {/if}
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Add any component-specific styles here */
  img {
    transition: opacity 0.3s ease;
  }
</style>