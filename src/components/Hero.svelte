<script>
    import { onMount } from 'svelte';
    import { fade, fly, scale } from 'svelte/transition';
    
    let visible = false;
    
    onMount(() => {
      setTimeout(() => {
        visible = true;
      }, 300);
    });
    
    // Animation for the chat bubbles
    let chatMessages = [
      { id: 1, text: "Hey there! How's it going?", position: 'left' },
      { id: 2, text: "Great! Just checking out this secure chat app.", position: 'right' },
      { id: 3, text: "It's amazing how private and secure it is!", position: 'left' }
    ];
  </script>
  
  <section class="pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Text content -->
      <div class="space-y-8">
        {#if visible}
          <div in:fly={{ y: 30, duration: 800, delay: 200 }}>
            <span class="inline-block px-3 py-1 text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full mb-2">
              End-to-End Encrypted
            </span>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span class="block">Secure Messaging</span>
              <span class="block mt-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Without Compromise
              </span>
            </h1>
          </div>
          
          <p 
            in:fly={{ y: 30, duration: 800, delay: 400 }}
            class="text-lg text-gray-300 max-w-lg"
          >
            Bluebox is a decentralized chat platform that puts your privacy first. 
            With end-to-end encryption and blockchain technology, your conversations 
            remain truly private and secure.
          </p>
          
          <div in:fly={{ y: 30, duration: 800, delay: 600 }} class="flex flex-col sm:flex-row gap-4">
            <a 
              href="#download" 
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-center"
            >
              Get Started
            </a>
            <a 
              href="#how-it-works" 
              class="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>How It Works</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        {/if}
      </div>
      
      <!-- Animated chat illustration -->
      <div class="relative">
        {#if visible}
          <div 
            in:scale={{ start: 0.8, duration: 1000, delay: 300 }}
            class="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-slate-700"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold">Secure Chat</h3>
                  <p class="text-xs text-gray-400">End-to-End Encrypted</p>
                </div>
              </div>
              <div class="flex gap-1">
                <div class="w-2 h-2 rounded-full bg-green-400"></div>
                <div class="text-xs text-gray-400">Online</div>
              </div>
            </div>
            
            <div class="space-y-4 mb-4">
              {#each chatMessages as message, i}
                <div 
                  in:fly={{ y: 20, duration: 400, delay: 700 + (i * 300) }}
                  class={`flex ${message.position === 'right' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    class={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.position === 'right' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-700 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              {/each}
            </div>
            
            <div 
              in:fly={{ y: 20, duration: 400, delay: 1600 }}
              class="relative"
            >
              <input 
                type="text" 
                placeholder="Type a message..." 
                class="w-full bg-slate-700/50 border border-slate-600 rounded-full py-3 px-4 pr-12 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            
            <!-- Animated encryption indicators -->
            <div 
              in:fade={{ duration: 1000, delay: 1800 }}
              class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-400 flex items-center gap-1 border border-slate-700 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              <span>End-to-End Encrypted</span>
            </div>
          </div>
          
          <!-- Decorative elements -->
          <div 
            in:fade={{ duration: 1000, delay: 1000 }}
            class="absolute -z-10 -top-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"
          ></div>
          <div 
            in:fade={{ duration: 1000, delay: 1200 }}
            class="absolute -z-10 -bottom-6 -left-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"
          ></div>
        {/if}
      </div>
    </div>
  </section>