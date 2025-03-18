<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  // Props
  export let disabled: boolean = false;
  export let placeholder: string = 'Type a message...';
  
  // Local state
  let text: string = '';
  let attachments: { [key: string]: string } = {};
  let isUploading: boolean = false;
  let uploadProgress: number = 0;
  let showEmojiPicker: boolean = false;
  let inputElement: HTMLTextAreaElement;
  let fileInputElement: HTMLInputElement;
  
  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    sendMessage: { text: string; attachments?: { [key: string]: string } };
  }>();
  
  // Handle form submission
  function handleSubmit() {
    if (disabled || (text.trim() === '' && Object.keys(attachments).length === 0)) {
      return;
    }
    
    dispatch('sendMessage', { text, attachments });
    
    // Reset form
    text = '';
    attachments = {};
    showEmojiPicker = false;
    
    // Focus input after sending
    setTimeout(() => {
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  }
  
  // Handle key press
  function handleKeyDown(event: KeyboardEvent) {
    // Send message on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
  
  // Handle file selection
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const files = Array.from(input.files);
    
    // Simulate file upload
    isUploading = true;
    uploadProgress = 0;
    
    const uploadInterval = setInterval(() => {
      uploadProgress += 10;
      
      if (uploadProgress >= 100) {
        clearInterval(uploadInterval);
        isUploading = false;
        
        // Simulate getting URLs back from server
        files.forEach(file => {
          // In a real app, this would be the URL returned from your file upload service
          const url = URL.createObjectURL(file);
          const key = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
          // Store in object format for Gun.js
          attachments[key] = url;
      });
      
      // Reset file input
      if (fileInputElement) {
        fileInputElement.value = '';
      }
    }
  }, 200);
}
  
  // Remove attachment
  function removeAttachment(index: number) {
    const keys = Object.keys(attachments);
    if (index >= 0 && index < keys.length) {
      const keyToRemove = keys[index];
      const newAttachments = { ...attachments };
      delete newAttachments[keyToRemove];
      attachments = newAttachments;
    }
  }
  
  // Toggle emoji picker
  function toggleEmojiPicker() {
    showEmojiPicker = !showEmojiPicker;
  }
  
  // Add emoji to text
  function addEmoji(emoji: string) {
    text += emoji;
    
    // Focus input after adding emoji
    if (inputElement) {
      inputElement.focus();
    }
  }
  
  // Auto-resize textarea
  function autoResize() {
    if (inputElement) {
      inputElement.style.height = 'auto';
      inputElement.style.height = `${inputElement.scrollHeight}px`;
    }
  }
  
  // Common emojis
  const commonEmojis = ['😊', '👍', '❤️', '🎉', '🔥', '😂', '🤔', '👏', '✅', '🙏', '🤝', '👋'];
  
  onMount(() => {
    // Focus input on mount
    if (inputElement && !disabled) {
      inputElement.focus();
    }
  });
  
  // Watch text changes to auto-resize
  $: if (text !== undefined) {
    setTimeout(autoResize, 0);
  }
</script>

<div class="relative">
  <!-- Attachments preview -->
  {#if Object.keys(attachments).length > 0}
    <div 
      in:fly={{ y: 20, duration: 200 }}
      out:fade={{ duration: 150 }}
      class="mb-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/30"
    >
      <div class="flex flex-wrap gap-2">
        {#each Object.entries(attachments) as [key, attachment], i}
          <div class="relative group">
            {#if attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i)}
              <div class="w-16 h-16 rounded-md overflow-hidden bg-slate-700/50">
                <img src={attachment || "/placeholder.svg"} alt="Attachment" class="w-full h-full object-cover" />
              </div>
            {:else if attachment.match(/\.pdf$/i)}
              <div class="w-16 h-16 rounded-md overflow-hidden bg-slate-700/50 flex items-center justify-center text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            {:else}
              <div class="w-16 h-16 rounded-md overflow-hidden bg-slate-700/50 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            {/if}
            
            <button 
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              on:click={() => removeAttachment(i)}
              aria-label="Remove attachment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Upload progress -->
  {#if isUploading}
    <div 
      in:fly={{ y: 20, duration: 200 }}
      out:fade={{ duration: 150 }}
      class="mb-2"
    >
      <div class="flex items-center">
        <div class="flex-1 bg-slate-700/30 rounded-full h-2 mr-2">
          <div 
            class="bg-blue-500 h-2 rounded-full transition-all duration-200 ease-out"
            style={`width: ${uploadProgress}%`}
          ></div>
        </div>
        <span class="text-xs text-slate-400">{uploadProgress}%</span>
      </div>
    </div>
  {/if}
  
  <!-- Message input form -->
  <form on:submit|preventDefault={handleSubmit} class="flex items-end">
    <div class="flex-1 relative">
      <textarea
        bind:this={inputElement}
        bind:value={text}
        on:keydown={handleKeyDown}
        on:input={autoResize}
        placeholder={placeholder}
        disabled={disabled}
        rows="1"
        class="w-full resize-none rounded-l-lg border-0 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
        style="min-height: 44px; max-height: 120px;"
      ></textarea>
      
      <!-- Emoji picker button -->
      <button
        type="button"
        class="absolute bottom-2 right-2 p-1.5 text-slate-400 hover:text-slate-300 focus:outline-none"
        on:click={toggleEmojiPicker}
        aria-label="Emoji picker"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Emoji picker -->
      {#if showEmojiPicker}
        <div 
          in:fly={{ y: 10, duration: 200 }}
          out:fade={{ duration: 150 }}
          class="absolute bottom-full mb-2 p-2 bg-slate-800 rounded-lg border border-slate-700/30 shadow-lg"
        >
          <div class="grid grid-cols-6 gap-2">
            {#each commonEmojis as emoji}
              <button
                type="button"
                class="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-700/50 rounded focus:outline-none"
                on:click={() => addEmoji(emoji)}
              >
                {emoji}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Attachment button -->
    <label class="p-3 text-slate-400 hover:text-slate-300 cursor-pointer">
      <input
        bind:this={fileInputElement}
        type="file"
        on:change={handleFileSelect}
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        class="hidden"
        disabled={disabled}
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
      </svg>
    </label>
    
    <!-- Send button -->
    <button
      type="submit"
      class="rounded-r-lg bg-blue-600 p-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:hover:bg-blue-600"
      disabled={disabled || (text.trim() === '' && Object.keys(attachments).length === 0)} aria-label="Send message"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
      </svg>
    </button>
  </form>
</div>

