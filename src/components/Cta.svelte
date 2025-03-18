<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    
    let visible = false;
    
    onMount(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visible = true;
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });
      
      const ctaSection = document.querySelector('#cta-section');
      if (ctaSection) {
        observer.observe(ctaSection);
      }
      
      return () => {
        observer.disconnect();
      };
    });
  </script>
  
  <section id="download" class="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
    <div id="cta-section" class="max-w-7xl mx-auto relative">
      {#if visible}
        <div 
          in:fade={{ duration: 800 }}
          class="relative bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl overflow-hidden"
        >
          <!-- Background elements -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div class="relative z-10 px-6 py-12 md:p-12 lg:p-16">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div 
                in:fly={{ y: 20, duration: 800 }}
                class="space-y-6"
              >
                <h2 class="text-3xl md:text-4xl font-bold">Ready to take control of your privacy?</h2>
                <p class="text-gray-400 text-lg">
                  Join thousands of users who have already made the switch to truly secure, private messaging.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="#" 
                    class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    <span>Download Now</span>
                  </a>
                  
                  <a 
                    href="#" 
                    class="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white font-medium transition-all duration-300 text-center"
                  >
                    Learn More
                  </a>
                </div>
                
                <div class="flex items-center gap-4 pt-4">
                  <div class="flex -space-x-2">
                    <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">JD</div>
                    <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white">MK</div>
                    <div class="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs text-white">TS</div>
                    <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">+5k</div>
                  </div>
                  <p class="text-sm text-gray-400">Joined by 5,000+ users this month</p>
                </div>
              </div>
              
              <div 
                in:fly={{ x: 20, duration: 800 }}
                class="relative"
              >
                <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                  <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 class="font-semibold">Bluebox</h3>
                        <div class="flex items-center gap-1">
                          <div class="w-2 h-2 rounded-full bg-green-400"></div>
                          <p class="text-xs text-gray-400">Available Now</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-4 mb-4">
                    <div class="flex justify-center">
                      <div class="max-w-xs px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        Ready to experience truly private messaging?
                      </div>
                    </div>
                    
                    <div class="flex justify-center">
                      <div class="max-w-xs px-4 py-2 rounded-2xl bg-slate-700 text-gray-200">
                        <div class="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          <span>End-to-End Encrypted</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex justify-center">
                      <div class="max-w-xs px-4 py-2 rounded-2xl bg-slate-700 text-gray-200">
                        <div class="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          <span>Decentralized Network</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="relative">
                    <div class="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-full py-3 px-4 text-gray-300">
                      <span>Download now to get started</span>
                      <div class="ml-auto w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </section>