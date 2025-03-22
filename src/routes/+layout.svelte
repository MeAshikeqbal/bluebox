<script context="module" lang="ts">
	// Declare Gun as a global variable
	declare const Gun: any;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeGun, gunInitialized } from '../lib/gun-store';
	import '../app.css';
	//import Gun from 'gun';
  
	// Initialize Gun.js
	onMount(() => {
	  try {
		// Check if Gun is available first
		if (typeof Gun === 'undefined') {
		  console.error('Gun.js not loaded yet. Waiting for scripts...');
		  
		  // Wait for Gun to be available (script loading)
		  const checkGun = setInterval(() => {
			if (typeof Gun !== 'undefined') {
			  clearInterval(checkGun);
			  console.log('Gun.js scripts loaded, initializing...');
			  initializeGun();
			}
		  }, 100);
		  
		  // Timeout after 10 seconds
		  setTimeout(() => {
			clearInterval(checkGun);
			if (typeof Gun === 'undefined') {
			  console.error('Gun.js failed to load after timeout');
			}
		  }, 10000);
		} else {
		  // Gun is already available, initialize
		  initializeGun();
		}
	  } catch (error) {
		console.error('Error in layout:', error);
	  }
	});
  </script>
  
  <svelte:head>
	<!-- Add Gun.js from CDN -->
	<script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/gun/sea.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/gun/lib/radix.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/gun/lib/radisk.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/gun/lib/store.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/gun/lib/rindexed.js"></script>
  </svelte:head>
  
  <slot />
  
  