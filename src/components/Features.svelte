<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { spring } from 'svelte/motion';
    
    /**
     * @typedef {'lock' | 'server' | 'shield' | 'key' | 'zap' | 'globe'} IconType
     */
    
    /**
     * @type {{ id: number, icon: IconType, title: string, description: string }[]}
     */
    let features = [
      {
        id: 1,
        icon: 'lock',
        title: 'End-to-End Encryption',
        description: 'Your messages are encrypted on your device and can only be decrypted by the intended recipient. Not even we can read your messages.'
      },
      {
        id: 2,
        icon: 'server',
        title: 'Decentralized Infrastructure',
        description: 'Built on blockchain technology, Bluebox eliminates the need for central servers, making it resistant to censorship and outages.'
      },
      {
        id: 3,
        icon: 'shield',
        title: 'Zero Knowledge Proof',
        description: 'Verify without revealing. Our zero-knowledge protocols ensure your identity is confirmed without exposing sensitive information.'
      },
      {
        id: 4,
        icon: 'key',
        title: 'Self-Sovereign Identity',
        description: 'You own your identity. No phone numbers or emails required, just your secure cryptographic keys that you control.'
      },
      {
        id: 5,
        icon: 'zap',
        title: 'Lightning Fast',
        description: 'Optimized protocols ensure your messages are delivered instantly, regardless of network conditions or location.'
      },
      {
        id: 6,
        icon: 'globe',
        title: 'Cross-Platform',
        description: 'Available on all major platforms. Your secure conversations follow you everywhere, with perfect synchronization.'
      }
    ];
    
    /**
	 * @type {any[]}
	 */
    let visibleFeatures = [];
    /** @type {IntersectionObserver | null} */
    let observer = null;
    
    function setupIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };
      
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = parseInt(entry.target.dataset.id);
            if (!visibleFeatures.includes(id)) {
              visibleFeatures = [...visibleFeatures, id];
            }
            if (observer) {
              observer.unobserve(entry.target);
            }
          }
        });
      }, options);
      
      // Observe all feature elements
      document.querySelectorAll('.feature-card').forEach(el => {
        if (observer) {
          observer.observe(el);
        }
      });
    }
    
    onMount(() => {
      setTimeout(() => {
        setupIntersectionObserver();
      }, 100);
      
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    });
    
    // Icon components
    const icons = {
      lock: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />`,
      server: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />`,
      shield: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />`,
      key: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />`,
      zap: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />`,
      globe: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`
    };
  </script>
  
  <section id="features" class="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">Secure by Design</h2>
      <p class="text-gray-400 max-w-2xl mx-auto">
        Bluebox is built from the ground up with security and privacy as the foundation, 
        not as an afterthought.
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each features as feature}
        <div 
          class="feature-card bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
          data-id={feature.id}
        >
          {#if visibleFeatures.includes(feature.id)}
            <div in:fly={{ y: 20, duration: 600 }}>
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-indigo-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {@html icons[feature.icon]}
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2 group-hover:text-blue-300 transition-colors duration-300">{feature.title}</h3>
              <p class="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </section>