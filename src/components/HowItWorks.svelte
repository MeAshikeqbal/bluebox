<script>
    import { onMount, tick } from 'svelte';
    import { fade, fly, draw, scale } from 'svelte/transition';
    import { elasticOut, backOut, quintOut, cubicInOut, quartOut } from 'svelte/easing';
    import { tweened } from 'svelte/motion';
    
    let visible = false;
    let activeStep = 1;
    let interval;
    let animationProgress = tweened(0, {
      duration: 1500,
      easing: cubicInOut
    });
    let containerRef;
    let isInView = false;
    
    const steps = [
      {
        id: 1,
        title: "Generate Keys",
        description: "When you first use Bluebox, a unique pair of cryptographic keys is generated on your device. The private key never leaves your device.",
        color: "blue",
        icon: "key"
      },
      {
        id: 2,
        title: "Connect Securely",
        description: "Connect with others using their public keys. No phone numbers or emails required, preserving your privacy from the start.",
        color: "indigo",
        icon: "users"
      },
      {
        id: 3,
        title: "End-to-End Encryption",
        description: "Every message is encrypted on your device and can only be decrypted by the intended recipient using their private key.",
        color: "cyan",
        icon: "lock"
      },
      {
        id: 4,
        title: "Decentralized Delivery",
        description: "Messages are routed through a decentralized network, making censorship nearly impossible and eliminating single points of failure.",
        color: "purple",
        icon: "network"
      }
    ];
    
    // Icons for steps
    const icons = {
      key: `<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>`,
      users: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
      lock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`,
      network: `<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>`
    };
    
    function setupIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isInView = true;
            visible = true;
            observer.disconnect();
          }
        });
      }, options);
      
      if (containerRef) {
        observer.observe(containerRef);
      }
      
      return observer;
    }
    
    function setStep(step) {
      if (activeStep === step) return;
      
      activeStep = step;
      animationProgress.set(0);
      setTimeout(() => {
        animationProgress.set(1);
      }, 100);
      
      // Reset the interval when manually changing steps
      clearInterval(interval);
      interval = setInterval(() => {
        activeStep = activeStep === steps.length ? 1 : activeStep + 1;
        animationProgress.set(0);
        setTimeout(() => {
          animationProgress.set(1);
        }, 100);
      }, 8000);
    }
    
    onMount(() => {
      const observer = setupIntersectionObserver();
      
      // Auto-advance steps when visible
      interval = setInterval(() => {
        if (visible) {
          activeStep = activeStep === steps.length ? 1 : activeStep + 1;
          animationProgress.set(0);
          setTimeout(() => {
            animationProgress.set(1);
          }, 100);
        }
      }, 8000);
      
      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    });
    
    // Helper function to get color classes
    function getColorClass(color, type) {
      const colorMap = {
        blue: {
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-500/20',
          bgGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
          bgGradientLight: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          gradient: 'from-blue-500/20 to-blue-600/20',
          fill: 'fill-blue-500',
          stroke: 'stroke-blue-400'
        },
        indigo: {
          bg: 'bg-indigo-500',
          bgLight: 'bg-indigo-500/20',
          bgGradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
          bgGradientLight: 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20',
          text: 'text-indigo-400',
          border: 'border-indigo-500/30',
          gradient: 'from-indigo-500/20 to-indigo-600/20',
          fill: 'fill-indigo-500',
          stroke: 'stroke-indigo-400'
        },
        cyan: {
          bg: 'bg-cyan-500',
          bgLight: 'bg-cyan-500/20',
          bgGradient: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
          bgGradientLight: 'bg-gradient-to-r from-cyan-500/20 to-cyan-600/20',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30',
          gradient: 'from-cyan-500/20 to-cyan-600/20',
          fill: 'fill-cyan-500',
          stroke: 'stroke-cyan-400'
        },
        purple: {
          bg: 'bg-purple-500',
          bgLight: 'bg-purple-500/20',
          bgGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
          bgGradientLight: 'bg-gradient-to-r from-purple-500/20 to-purple-600/20',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          gradient: 'from-purple-500/20 to-purple-600/20',
          fill: 'fill-purple-500',
          stroke: 'stroke-purple-400'
        },
        green: {
          bg: 'bg-green-500',
          bgLight: 'bg-green-500/20',
          bgGradient: 'bg-gradient-to-r from-green-500 to-green-600',
          bgGradientLight: 'bg-gradient-to-r from-green-500/20 to-green-600/20',
          text: 'text-green-400',
          border: 'border-green-500/30',
          gradient: 'from-green-500/20 to-green-600/20',
          fill: 'fill-green-500',
          stroke: 'stroke-green-400'
        }
      };
      
      return colorMap[color][type];
    }
  </script>
  
  <section 
    id="how-it-works" 
    class="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    bind:this={containerRef}
  >
    <!-- Background elements -->
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 to-slate-900/0 opacity-40"></div>
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
    </div>
  
    {#if visible}
      <div 
        in:fly={{ y: -30, duration: 800, easing: backOut }}
        class="text-center mb-20 relative"
      >
        <span class="inline-block px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 rounded-full mb-3 backdrop-blur-sm border border-blue-500/10">
          Simple & Secure
        </span>
        <h2 class="text-4xl md:text-5xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">How It Works</h2>
        <p class="text-gray-400 max-w-2xl mx-auto text-lg">
          Bluebox uses cutting-edge cryptography and decentralized technology to ensure your conversations remain private.
        </p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <!-- Steps -->
        <div 
          in:fly={{ x: -30, duration: 800, delay: 200, easing: backOut }}
          class="lg:col-span-5 space-y-4"
        >
          {#each steps as step, i}
            <div 
              class={`p-1 rounded-2xl transition-all duration-500 cursor-pointer relative overflow-hidden ${activeStep === step.id ? 'scale-105 z-10' : 'hover:scale-102'}`}
              on:click={() => setStep(step.id)}
              on:keydown={(e) => e.key === 'Enter' && setStep(step.id)}
              tabindex="0"
              role="button"
              aria-pressed={activeStep === step.id}
              in:fly={{ y: 20, duration: 600, delay: 300 + i * 150, easing: backOut }}
            >
              <!-- Glowing border when active -->
              <div class={`absolute inset-0 ${activeStep === step.id ? getColorClass(step.color, 'bgGradientLight') : 'bg-slate-800/30'} rounded-2xl ${activeStep === step.id ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}></div>
              
              <!-- Card content -->
              <div class={`relative z-10 p-5 rounded-xl backdrop-blur-sm border ${activeStep === step.id ? getColorClass(step.color, 'border') : 'border-slate-700/50'} bg-slate-800/50 transition-all duration-500`}>
                <div class="flex items-start gap-4">
                  <div class={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${activeStep === step.id ? getColorClass(step.color, 'bgGradient') : 'bg-slate-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" class={`h-6 w-6 ${activeStep === step.id ? 'text-white' : 'text-gray-300'} transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      {@html icons[step.icon]}
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h3 class={`text-xl font-semibold mb-2 transition-colors duration-300 ${activeStep === step.id ? getColorClass(step.color, 'text') : 'text-white'}`}>
                        {step.title}
                      </h3>
                      <span class={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${activeStep === step.id ? getColorClass(step.color, 'bg') + ' text-white' : 'bg-slate-700/50 text-gray-400'}`}>
                        {step.id}
                      </span>
                    </div>
                    <p class="text-gray-400">{step.description}</p>
                  </div>
                </div>
                
                <!-- Progress indicator -->
                {#if activeStep === step.id}
                  <div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent" style="width: 100%; opacity: 0.2; transform-origin: left center; animation: pulse-width 4s infinite;">
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
        
        <!-- Animated illustration -->
        <div 
          in:fly={{ x: 30, duration: 800, delay: 400, easing: backOut }}
          class="lg:col-span-7 relative h-[500px]"
        >
          <div class="absolute inset-0 rounded-3xl overflow-hidden backdrop-blur-sm border border-slate-700/50 bg-slate-800/30">
            <!-- Glowing background based on active step -->
            <div class={`absolute inset-0 ${getColorClass(steps[activeStep-1].color, 'bgLight')} opacity-10 transition-colors duration-500`}></div>
            
            <!-- Animation based on active step -->
            {#key activeStep}
              <div 
                in:fade={{ duration: 300 }}
                class="absolute inset-0 p-8 flex flex-col"
              >
                <h3 
                  in:fly={{ y: -20, duration: 400 }}
                  class={`text-2xl font-semibold mb-6 ${getColorClass(steps[activeStep-1].color, 'text')}`}
                >
                  {steps[activeStep-1].title}
                </h3>
                
                <!-- Dynamic diagram based on active step -->
                <div class="flex-1 flex items-center justify-center">
                    {#if activeStep === 1}
                      <!-- Step 1: Generate Keys -->
                      <div class="relative w-full h-full flex items-center justify-center">
                        <!-- Device with improved styling -->
                        <div 
                          in:fly={{ y: 30, duration: 600, delay: 100, easing: quartOut }}
                          class="relative w-72 h-56 bg-gradient-to-b from-slate-700/80 to-slate-800/80 rounded-2xl border border-slate-600/50 p-4 flex flex-col items-center justify-center shadow-lg"
                          style="box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.8), 0 0 15px -5px rgba(59, 130, 246, 0.3);"
                        >
                          <!-- Screen with improved inner glow -->
                          <div class="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl flex items-center justify-center overflow-hidden shadow-inner relative">
                            <!-- Screen glow effect -->
                            <div class="absolute inset-0 bg-blue-500/5 opacity-0 animate-pulse-slow"></div>
                            
                            {#if $animationProgress > 0.1}
                              <div 
                                in:scale={{ duration: 400, easing: backOut }}
                                class="relative z-10"
                              >
                                <!-- Key generation animation with improved visuals -->
                                <div class="w-28 h-28 relative">
                                  <svg viewBox="0 0 100 100" class="w-full h-full">
                                    <!-- Outer glow -->
                                    {#if $animationProgress > 0.15}
                                      <circle 
                                        cx="50" 
                                        cy="50" 
                                        r="48" 
                                        fill="none" 
                                        stroke="#1e40af" 
                                        stroke-width="1"
                                        opacity="0.2"
                                        class="animate-ping-slow"
                                      />
                                    {/if}
                                    
                                    <!-- Circular progress with improved gradient -->
                                    {#if $animationProgress > 0.2}
                                      <circle 
                                        cx="50" 
                                        cy="50" 
                                        r="45" 
                                        fill="none" 
                                        stroke="url(#blueGradient)" 
                                        stroke-width="4"
                                        stroke-dasharray="283"
                                        stroke-dashoffset={283 - (283 * Math.min($animationProgress * 2, 1))}
                                        in:draw={{ duration: 1500 }}
                                        filter="drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))"
                                      />
                                      
                                      <defs>
                                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                          <stop offset="0%" stop-color="#3b82f6" />
                                          <stop offset="100%" stop-color="#2563eb" />
                                        </linearGradient>
                                      </defs>
                                    {/if}
                                    
                                    <!-- Rotating inner circle for added visual interest -->
                                    {#if $animationProgress > 0.4}
                                      <circle 
                                        cx="50" 
                                        cy="50" 
                                        r="30" 
                                        fill="none" 
                                        stroke="#60a5fa" 
                                        stroke-width="1"
                                        stroke-dasharray="15,5"
                                        opacity="0.3"
                                        class="animate-spin-slow"
                                      />
                                    {/if}
                                    
                                    <!-- Key icon with improved styling -->
                                    {#if $animationProgress > 0.6}
                                      <g 
                                        in:scale={{ duration: 400, easing: elasticOut }}
                                        class="fill-blue-500"
                                        filter="drop-shadow(0 0 3px rgba(59, 130, 246, 0.7))"
                                      >
                                        <path d="M65,45 C65,36.716 58.284,30 50,30 C41.716,30 35,36.716 35,45 C35,53.284 41.716,60 50,60 C58.284,60 65,53.284 65,45 Z M50,55 C44.477,55 40,50.523 40,45 C40,39.477 44.477,35 50,35 C55.523,35 60,39.477 60,45 C60,50.523 55.523,55 50,55 Z" />
                                        <path d="M50,60 L50,75 L45,75 L45,65 L40,65 L40,75 L35,75 L35,65 L30,65 L30,75 L25,75 L25,65 L20,65 L20,70 L15,70 L15,60 L50,60 Z" />
                                      </g>
                                    {/if}
                                    
                                    <!-- Small particles for added visual interest -->
                                    {#if $animationProgress > 0.7}
                                      <circle cx="35" cy="35" r="1" fill="#93c5fd" class="animate-ping-slow" style="animation-delay: 0.2s;" />
                                      <circle cx="65" cy="40" r="1" fill="#93c5fd" class="animate-ping-slow" style="animation-delay: 0.5s;" />
                                      <circle cx="45" cy="70" r="1" fill="#93c5fd" class="animate-ping-slow" style="animation-delay: 0.8s;" />
                                    {/if}
                                  </svg>
                                </div>
                                
                                {#if $animationProgress > 0.8}
                                  <div 
                                    in:fly={{ y: 10, duration: 400, easing: backOut }}
                                    class="text-center mt-3"
                                  >
                                    <div class="text-sm text-blue-400 font-medium bg-blue-500/10 px-3 py-1 rounded-full inline-block">Keys Generated</div>
                                    <div class="text-xs text-gray-400 mt-2">Private key secured on device</div>
                                  </div>
                                {/if}
                              </div>
                            {/if}
                          </div>
                          
                          <!-- Device details with improved styling -->
                          <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-slate-600/50 rounded-full"></div>
                          
                          <!-- Added device reflection -->
                          <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-blue-500/5 rounded-full blur-md"></div>
                        </div>
                        
                        <!-- Key details with improved styling -->
                        {#if $animationProgress > 0.9}
                          <div 
                            in:fly={{ y: 20, duration: 400, delay: 1000, easing: backOut }}
                            class="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-6"
                          >
                            <div class="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-lg group hover:border-blue-500/40 transition-all duration-300">
                              <div class="flex items-center mb-2">
                                <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-2 group-hover:bg-blue-500/30 transition-colors duration-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                </div>
                                <div class="text-sm font-medium text-blue-400">Private Key</div>
                              </div>
                              <div class="text-xs text-gray-400 pl-10">Stays on your device</div>
                            </div>
                            
                            <div class="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20 rounded-xl shadow-lg group hover:border-green-500/40 transition-all duration-300">
                              <div class="flex items-center mb-2">
                                <div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mr-2 group-hover:bg-green-500/30 transition-colors duration-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div class="text-sm font-medium text-green-400">Public Key</div>
                              </div>
                              <div class="text-xs text-gray-400 pl-10">Shared with contacts</div>
                            </div>
                          </div>
                        {/if}
                      </div>
                                    
                  {:else if activeStep === 2}
                    <!-- Step 2: Connect Securely -->
                    <div class="relative w-full h-full flex items-center justify-center">
                      <!-- Users -->
                      <div class="flex flex-col items-center">
                        <div class="flex items-center gap-40 mb-16">
                          <!-- User 1 -->
                          <div 
                            in:fly={{ x: -50, duration: 600, delay: 100, easing: backOut }}
                            class="flex flex-col items-center"
                          >
                            <div class="w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/10 border border-indigo-500/20">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div class="text-sm text-indigo-400 font-medium">User A</div>
                            
                            {#if $animationProgress > 0.3}
                              <div 
                                in:fly={{ y: 10, duration: 400, easing: backOut }}
                                class="mt-3 px-4 py-2 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-sm border border-indigo-500/20 rounded-xl shadow-lg"
                              >
                                <div class="text-xs text-gray-400">Public Key</div>
                                <div class="text-xs font-mono text-indigo-400 truncate w-24">A72F...9D3B</div>
                              </div>
                            {/if}
                          </div>
                          
                          <!-- User 2 -->
                          <div 
                            in:fly={{ x: 50, duration: 600, delay: 100, easing: backOut }}
                            class="flex flex-col items-center"
                          >
                            <div class="w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/10 border border-indigo-500/20">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div class="text-sm text-indigo-400 font-medium">User B</div>
                            
                            {#if $animationProgress > 0.3}
                              <div 
                                in:fly={{ y: 10, duration: 400, easing: backOut }}
                                class="mt-3 px-4 py-2 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-sm border border-indigo-500/20 rounded-xl shadow-lg"
                              >
                                <div class="text-xs text-gray-400">Public Key</div>
                                <div class="text-xs font-mono text-indigo-400 truncate w-24">F83C...1E5A</div>
                              </div>
                            {/if}
                          </div>
                        </div>
                        
                        <!-- Connection animation -->
                        {#if $animationProgress > 0.5}
                          <div 
                            in:scale={{ duration: 600, easing: elasticOut }}
                            class="relative w-72 h-24"
                          >
                            <svg viewBox="0 0 240 80" class="w-full h-full">
                              <!-- Connection path -->
                              <path 
                                d="M20,40 C60,0 180,80 220,40" 
                                fill="none" 
                                stroke="url(#indigoGradient)" 
                                stroke-width="2" 
                                stroke-dasharray="6,3"
                                in:draw={{ duration: 1500 }}
                              />
                              
                              <defs>
                                <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stop-color="#6366f1" />
                                  <stop offset="100%" stop-color="#4f46e5" />
                                </linearGradient>
                              </defs>
                              
                              <!-- Animated packet -->
                              {#if $animationProgress > 0.7}
                                <circle 
                                  cx="20" 
                                  cy="40" 
                                  r="5" 
                                  fill="#818cf8"
                                  in:scale={{ duration: 300 }}
                                >
                                  <animateMotion
                                    path="M0,0 C40,-40 160,40 200,0"
                                    dur="3s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              {/if}
                              
                              <!-- Lock icon -->
                              {#if $animationProgress > 0.8}
                                <g 
                                  transform="translate(110, 20)" 
                                  in:scale={{ duration: 400, delay: 1000, easing: elasticOut }}
                                >
                                  <rect x="0" y="0" width="20" height="20" rx="5" fill="url(#indigoGradient)" />
                                  <path d="M5,8 V5 a5,5 0 0,1 10,0 v3" stroke="white" fill="none" stroke-width="2" />
                                </g>
                              {/if}
                            </svg>
                          </div>
                        {/if}
                        
                        {#if $animationProgress > 0.9}
                          <div 
                            in:fly={{ y: 20, duration: 400, delay: 1500, easing: backOut }}
                            class="text-center mt-6"
                          >
                            <div class="text-base text-indigo-400 font-medium">Secure Connection Established</div>
                            <div class="text-sm text-gray-400 mt-1">No phone numbers or emails required</div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  
                  {:else if activeStep === 3}
                    <!-- Step 3: End-to-End Encryption -->
                    <div class="relative w-full h-full flex items-center justify-center">
                      <div class="w-full max-w-lg">
                        <!-- Message flow -->
                        <div class="relative h-72">
                          <!-- Sender -->
                          <div 
                            in:fly={{ x: -30, duration: 600, delay: 100, easing: backOut }}
                            class="absolute left-0 top-0 flex flex-col items-center"
                          >
                            <div class="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 shadow-lg shadow-cyan-500/10 border border-cyan-500/20">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div class="text-sm text-cyan-400 font-medium">Sender</div>
                          </div>
                          
                          <!-- Receiver -->
                          <div 
                            in:fly={{ x: 30, duration: 600, delay: 100, easing: backOut }}
                            class="absolute right-0 top-0 flex flex-col items-center"
                          >
                            <div class="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 shadow-lg shadow-cyan-500/10 border border-cyan-500/20">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div class="text-sm text-cyan-400 font-medium">Receiver</div>
                          </div>
                          
                          <!-- Message path -->
                          <svg class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-40" viewBox="0 0 300 100">
                            <!-- Path for the message -->
                            {#if $animationProgress > 0.2}
                              <path 
                                d="M30,30 C80,10 220,90 270,30" 
                                fill="none" 
                                stroke="url(#cyanGradient)" 
                                stroke-width="2"
                                stroke-dasharray="5,5"
                                in:draw={{ duration: 1000 }}
                              />
                              
                              <defs>
                                <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stop-color="#06b6d4" />
                                  <stop offset="100%" stop-color="#0891b2" />
                                </linearGradient>
                              </defs>
                            {/if}
                            
                            <!-- Encryption/Decryption stages -->
                            {#if $animationProgress > 0.4}
                              <!-- Encryption -->
                              <g 
                                transform="translate(60, 20)" 
                                in:scale={{ duration: 400, delay: 500, easing: elasticOut }}
                              >
                                <rect x="0" y="0" width="40" height="25" rx="6" fill="url(#cyanGradient)" />
                                <text x="20" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">Encrypt</text>
                              </g>
                              
                              <!-- Decryption -->
                              <g 
                                transform="translate(200, 20)" 
                                in:scale={{ duration: 400, delay: 700, easing: elasticOut }}
                              >
                                <rect x="0" y="0" width="40" height="25" rx="6" fill="url(#cyanGradient)" />
                                <text x="20" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">Decrypt</text>
                              </g>
                            {/if}
                            
                            <!-- Animated message -->
                            {#if $animationProgress > 0.6}
                              <g in:scale={{ duration: 300, delay: 900, easing: backOut }}>
                                <!-- Original message -->
                                <rect x="10" y="60" width="40" height="20" rx="6" fill="#22d3ee" opacity="0.8" />
                                <text x="30" y="74" text-anchor="middle" fill="white" font-size="8" font-weight="bold">Hello</text>
                                
                                <!-- Encrypted message -->
                                <rect x="130" y="60" width="40" height="20" rx="6" fill="#0e7490" opacity="0.8" />
                                <text x="150" y="74" text-anchor="middle" fill="white" font-size="6" font-family="monospace" font-weight="bold">A7F3..</text>
                                
                                <!-- Decrypted message -->
                                <rect x="250" y="60" width="40" height="20" rx="6" fill="#22d3ee" opacity="0.8" />
                                <text x="270" y="74" text-anchor="middle" fill="white" font-size="8" font-weight="bold">Hello</text>
                                
                                <!-- Animation arrows -->
                                <path d="M55,70 L125,70" stroke="#0ea5e9" stroke-width="1.5" marker-end="url(#arrowhead)" />
                                <path d="M175,70 L245,70" stroke="#0ea5e9" stroke-width="1.5" marker-end="url(#arrowhead)" />
                                
                                <!-- Arrow marker definition -->
                                <defs>
                                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#0ea5e9" />
                                  </marker>
                                </defs>
                              </g>
                            {/if}
                          </svg>
                        </div>
                        
                        <!-- Explanation -->
                        {#if $animationProgress > 0.8}
                          <div 
                            in:fly={{ y: 20, duration: 400, delay: 1200, easing: backOut }}
                            class="mt-12 grid grid-cols-2 gap-6"
                          >
                            <div class="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 backdrop-blur-sm border border-cyan-500/20 rounded-xl shadow-lg">
                              <div class="text-sm font-medium text-cyan-400 mb-1">Sender Encrypts</div>
                              <div class="text-xs text-gray-400">Using receiver's public key</div>
                            </div>
                            
                            <div class="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 backdrop-blur-sm border border-cyan-500/20 rounded-xl shadow-lg">
                              <div class="text-sm font-medium text-cyan-400 mb-1">Receiver Decrypts</div>
                              <div class="text-xs text-gray-400">Using their private key</div>
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  
                  {:else if activeStep === 4}
                    <!-- Step 4: Decentralized Delivery -->
                    <div class="relative w-full h-full flex items-center justify-center">
                      <div class="w-full max-w-lg">
                        <!-- Network visualization -->
                        <div class="relative h-72">
                          <svg viewBox="0 0 300 200" class="w-full h-full">
                            <!-- Central node -->
                            {#if $animationProgress > 0.1}
                              <g in:scale={{ duration: 500, delay: 100, easing: elasticOut }}>
                                <circle cx="150" cy="100" r="15" class={getColorClass('purple', 'fill')} opacity="0.3" />
                                <circle cx="150" cy="100" r="8" class={getColorClass('purple', 'fill')} />
                              </g>
                            {/if}
                            
                            <!-- Network nodes -->
                            {#if $animationProgress > 0.2}
                              <g in:scale={{ duration: 500, delay: 200, easing: elasticOut }}>
                                <circle cx="60" cy="50" r="12" class={getColorClass('purple', 'fill')} opacity="0.3" />
                                <circle cx="60" cy="50" r="6" class={getColorClass('purple', 'fill')} />
                              </g>
                            {/if}
                            
                            {#if $animationProgress > 0.25}
                              <g in:scale={{ duration: 500, delay: 250, easing: elasticOut }}>
                                <circle cx="240" cy="50" r="12" class={getColorClass('purple', 'fill')} opacity="0.3" />
                                <circle cx="240" cy="50" r="6" class={getColorClass('purple', 'fill')} />
                              </g>
                            {/if}
                            
                            {#if $animationProgress > 0.3}
                              <g in:scale={{ duration: 500, delay: 300, easing: elasticOut }}>
                                <circle cx="40" cy="150" r="12" class={getColorClass('purple', 'fill')} opacity="0.3" />
                                <circle cx="40" cy="150" r="6" class={getColorClass('purple', 'fill')} />
                              </g>
                            {/if}
                            
                            {#if $animationProgress > 0.35}
                              <g in:scale={{ duration: 500, delay: 350, easing: elasticOut }}>
                                <circle cx="260" cy="150" r="12" class={getColorClass('purple', 'fill')} opacity="0.3" />
                                <circle cx="260" cy="150" r="6" class={getColorClass('purple', 'fill')} />
                              </g>
                            {/if}
                            
                            {#if $animationProgress > 0.4}
                              <g in:scale={{ duration: 500, delay: 400, easing: elasticOut }}>
                                <circle cx="120" cy="180" r="12" class={getColorClass('purple', 'fill')} opacity="0.3" />
                                <circle cx="120" cy="180" r="6" class={getColorClass('purple', 'fill')} />
                              </g>
                            {/if}
                            
                            {#if $animationProgress > 0.45}
                              <g in:scale={{ duration: 500, delay: 450, easing: elasticOut }}>
                                <circle cx="180" cy="180" r="12" class={getColorClass('purple', 'fill')} opacity="0.3" />
                                <circle cx="180" cy="180" r="6" class={getColorClass('purple', 'fill')} />
                              </g>
                            {/if}
                            
                            <!-- Connection lines -->
                            {#if $animationProgress > 0.5}
                              <svg in:draw={{ duration: 1000, delay: 500 }}>
                                <line x1="150" y1="100" x2="60" y2="50" class={getColorClass('purple', 'stroke')} stroke-width="1.5" />
                                <line x1="150" y1="100" x2="240" y2="50" class={getColorClass('purple', 'stroke')} stroke-width="1.5" />
                                <line x1="150" y1="100" x2="40" y2="150" class={getColorClass('purple', 'stroke')} stroke-width="1.5" />
                                <line x1="150" y1="100" x2="260" y2="150" class={getColorClass('purple', 'stroke')} stroke-width="1.5" />
                                <line x1="150" y1="100" x2="120" y2="180" class={getColorClass('purple', 'stroke')} stroke-width="1.5" />
                                <line x1="150" y1="100" x2="180" y2="180" class={getColorClass('purple', 'stroke')} stroke-width="1.5" />
                                
                                <line x1="60" y1="50" x2="240" y2="50" class={getColorClass('purple', 'stroke')} stroke-width="1" stroke-dasharray="4,4" />
                                <line x1="40" y1="150" x2="260" y2="150" class={getColorClass('purple', 'stroke')} stroke-width="1" stroke-dasharray="4,4" />
                                <line x1="120" y1="180" x2="180" y2="180" class={getColorClass('purple', 'stroke')} stroke-width="1" stroke-dasharray="4,4" />
                              </svg>
                            {/if}
                            
                            <!-- Message packet animation -->
                            {#if $animationProgress > 0.7}
                              <!-- Sender -->
                              <g in:scale={{ duration: 300, delay: 700, easing: elasticOut }}>
                                <circle cx="60" cy="50" r="4" fill="#a855f7" />
                                <text x="45" y="35" fill="#a855f7" font-size="8" font-weight="bold">Sender</text>
                              </g>
                              
                              <!-- Receiver -->
                              <g in:scale={{ duration: 300, delay: 700, easing: elasticOut }}>
                                <circle cx="260" cy="150" r="4" fill="#a855f7" />
                                <text x="260" y="170" fill="#a855f7" font-size="8" text-anchor="middle" font-weight="bold">Receiver</text>
                              </g>
                              
                              <!-- Animated packet -->
                              <circle cx="60" cy="50" r="3" fill="white">
                                <animateMotion
                                  path="M0,0 L90,50 L-20,100 L110,50 L0,0"
                                  dur="4s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            {/if}
                          </svg>
                        </div>
                        
                        <!-- Explanation -->
                        {#if $animationProgress > 0.8}
                          <div 
                            in:fly={{ y: 20, duration: 400, delay: 1200, easing: backOut }}
                            class="mt-6 grid grid-cols-2 gap-6"
                          >
                            <div class="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg">
                              <div class="text-sm font-medium text-purple-400 mb-1">No Central Server</div>
                              <div class="text-xs text-gray-400">Messages route through multiple nodes</div>
                            </div>
                            
                            <div class="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg">
                              <div class="text-sm font-medium text-purple-400 mb-1">Censorship Resistant</div>
                              <div class="text-xs text-gray-400">No single point of failure</div>
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            {/key}
          </div>
        </div>
      </div>
    {/if}
  </section>
  
  <style>
    /* Custom animations */
    @keyframes pulse-width {
      0%, 100% { transform: scaleX(0.7); opacity: 0.2; }
      50% { transform: scaleX(1); opacity: 0.4; }
    }
    
    /* Hover scale */
    .hover\:scale-102:hover {
      transform: scale(1.02);
    }
    
    /* Ensure SVG animations work properly */
    svg {
      overflow: visible;
    }
  </style>