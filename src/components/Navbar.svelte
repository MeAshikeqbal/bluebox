<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    
    let scrolled = false;
    let menuOpen = false;
    
    function toggleMenu() {
      menuOpen = !menuOpen;
    }
    
    function handleScroll() {
      scrolled = window.scrollY > 20;
    }
    
    onMount(() => {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    });
  </script>
  
  <nav class={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <a href="/" class="flex items-center space-x-2 group">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-xl font-bold text-white">Bluebox</span>
          </a>
        </div>
        
        <!-- Desktop menu -->
        <div class="hidden md:flex items-center space-x-8">
          <a href="#features" class="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Features</a>
          <a href="#how-it-works" class="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">How It Works</a>
          <a href="#security" class="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium">Security</a>
          <a href="#download" class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm font-medium">
            Get Started
          </a>
        </div>
        
        <!-- Mobile menu button -->
        <div class="flex items-center md:hidden">
          <button 
            on:click={toggleMenu}
            class="text-gray-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {#if menuOpen}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              {/if}
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mobile menu -->
    {#if menuOpen}
      <div 
        in:fly={{ y: -20, duration: 300 }}
        out:fly={{ y: -20, duration: 300 }}
        class="md:hidden bg-slate-800 shadow-lg"
      >
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="#features" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700">Features</a>
          <a href="#how-it-works" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700">How It Works</a>
          <a href="#security" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700">Security</a>
          <a href="#download" class="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white">Get Started</a>
        </div>
      </div>
    {/if}
  </nav>