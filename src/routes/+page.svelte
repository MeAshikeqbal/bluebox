<script>
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { spring } from 'svelte/motion';

	import Hero from '../components/Hero.svelte';
	import Features from '../components/Features.svelte';
	//import HowItWorks from '../components/HowItWorks.svelte';
	import Cta from '../components/Cta.svelte';
	import Footer from '../components/Footer.svelte';
	import Navbar from '../components/Navbar.svelte';

	let loaded = false;
	/**
	 * @type {number}
	 */
	let scrollY;

	// Spring animation for the scroll progress
	const scrollProgress = spring(0, {
		stiffness: 0.1,
		damping: 0.25
	});

	onMount(() => {
		setTimeout(() => {
			loaded = true;
		}, 100);
	});

	$: {
		if (typeof window !== 'undefined') {
			scrollProgress.set(scrollY / (document.body.scrollHeight - window.innerHeight));
		}
	}
</script>

<svelte:window bind:scrollY />

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white"
>
	<!-- Animated background elements -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		{#if loaded}
			<div
				transition:fade={{ duration: 1000 }}
				class="absolute top-20 -right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
			></div>
			<div
				transition:fade={{ duration: 1000, delay: 200 }}
				class="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
			></div>
			<div
				transition:fade={{ duration: 1000, delay: 400 }}
				class="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl"
			></div>
		{/if}
	</div>

	<!-- Progress indicator -->
	<div class="fixed top-0 left-0 z-50 h-1 w-full">
		<div
			class="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
			style="width: {$scrollProgress * 100}%"
		></div>
	</div>

	<div class="relative z-10">
		{#if loaded}
			<div in:fade={{ duration: 300, delay: 100 }}>
				<Navbar />
			</div>

			<div in:fade={{ duration: 500, delay: 300 }}>
				<Hero />
			</div>

			<div in:fade={{ duration: 500, delay: 500 }}>
				<Features />
			</div>
            
			<div in:fade={{ duration: 500, delay: 900 }}>
				<Cta />
			</div>

			<div in:fade={{ duration: 500, delay: 1100 }}>
				<Footer />
			</div>
		{/if}
	</div>
</div>
