<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { elasticOut, backOut, cubicInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { user, authError, authLoading } from '../../lib/auth-store';

	let userId = '';
	let password = '';
	let isLoading = false;
	let visible = false;
	let showPassword = false;
	let errorMessage = '';
	let successMessage = '';
	
	// Gun.js instance
	let gun: any;
	let user$: any;
	
	/**
	 * @type {HTMLElement}
	 */
	let containerRef: HTMLElement;

	// Animation progress for the background elements
	const backgroundProgress = tweened(0, {
		duration: 1500,
		easing: cubicInOut
	});

	// Animation progress for the form elements
	const formProgress = tweened(0, {
		duration: 1000,
		easing: cubicInOut
	});

	async function handleSubmit(): Promise<void> {
		if (!userId || !password) {
			errorMessage = 'Please enter both user ID and password';
			return;
		}

		isLoading = true;
		authLoading.set(true);
		errorMessage = '';
		
		try {
			// Authenticate with Gun.js
			user$.auth(userId, password, (ack: any) => {
				if (ack.err) {
					errorMessage = ack.err;
					authError.set(ack.err);
					isLoading = false;
					authLoading.set(false);
					return;
				}
				
				// Get user profile data
				user$.get('profile').once((profile: any) => {
					// Update user store
					user.set({
						username: userId,
						email: profile?.email || ''
					});
					
					// Show success message
					successMessage = 'Login successful!';
					
					// Redirect to chat after a short delay
					setTimeout(() => {
						isLoading = false;
						authLoading.set(false);
						window.location.href = '/chat';
					}, 1500);
				});
			});
		} catch (error: any) {
			console.error('Login error:', error);
			errorMessage = error.message || 'An unexpected error occurred';
			authError.set(errorMessage);
			isLoading = false;
			authLoading.set(false);
		}
	}

	function setupIntersectionObserver(): IntersectionObserver {
		const options = {
			root: null,
			rootMargin: '0px',
			threshold: 0.1
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					visible = true;
					backgroundProgress.set(1);
					setTimeout(() => {
						formProgress.set(1);
					}, 300);
					observer.disconnect();
				}
			});
		}, options);

		if (containerRef) {
			observer.observe(containerRef);
		}

		return observer;
	}

	onMount(() => {
		// Initialize Gun.js
		gun = new (window as any).Gun({
			peers: ['http://192.168.1.7:8765/gun'], // Replace with your Gun server
			localStorage: false, // Use IndexedDB instead of localStorage
			radisk: true // Enable RadISK for better storage
		});
		
		// Get user instance
		user$ = gun.user();
		
		// Check if user is already logged in
		user$.recall({ sessionStorage: true }, (ack: any) => {
			if (ack.err) {
				console.error('Session recall error:', ack.err);
				return;
			}
			
			// If user is already authenticated, redirect to chat
			if (user$.is) {
				user$.get('profile').once((profile: any) => {
					if (profile) {
						user.set({
							username: profile.username,
							email: profile.email
						});
						window.location.href = '/chat';
					}
				});
			}
		});
		
		const observer = setupIntersectionObserver();

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
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

<div
	class="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
	bind:this={containerRef}
>
	<!-- Modern background elements -->
	<div class="absolute inset-0 -z-10 overflow-hidden">
		<div
			class="absolute top-0 left-0 h-full w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 opacity-90"
		></div>

		{#if visible}
			<!-- Animated gradient orbs -->
			<div
				in:fade={{ duration: 1200 }}
				class="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl"
				style="transform: scale({$backgroundProgress * 1.2}); opacity: {$backgroundProgress * 0.6};"
			></div>
			<div
				in:fade={{ duration: 1200, delay: 200 }}
				class="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl"
				style="transform: scale({$backgroundProgress * 1.2}); opacity: {$backgroundProgress * 0.6};"
			></div>

			<!-- Subtle grid pattern -->
			<div
				class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS0yLTRoMnYyaC0ydi0yek0zNCAyMHYyaC0ydi0yaDJ6bTAgNGgydjJoLTJ2LTJ6bS00LTRoMnYyaC0ydi0yek0zMCAyMHYyaC0ydi0yaDJ6bS00IDRoMnYyaC0ydi0yek0yNiAyMHYyaC0ydi0yaDJ6bTAgOGgydjJoLTJ2LTJ6bS00LTRoMnYyaC0ydi0yek0yMiAyMHYyaC0ydi0yaDJ6bTAgOGgydjJoLTJ2LTJ6bS00LThoMnYyaC0ydi0yek0xOCAyMHYyaC0ydi0yaDJ6bTAgNGgydjJoLTJ2LTJ6bS00LTRoMnYyaC0ydi0yek0xNCAyMHYyaC0ydi0yaDJ6bTAgOGgydjJoLTJ2LTJ6bS00LThoMnYyaC0ydi0yek0xMCAyMHYySDh2LTJoMnptMCA0aDJ2MmgtMnYtMnptLTQtNGgydjJIOHYtMnptMCA4aDJ2Mkg4di0yek00IDIwdjJIMnYtMmgyem0wIDRoMnYySDR2LTJ6bTAtOGgydjJINHYtMnptMCA4aDJ2Mkg0di0yem00LTEyaDJ2Mkg4di0yek00IDh2Mkgydi0yaDJ6bTQgMGgydjJIOHYtMnptNC00aDJ2Mkg4Vi00em00IDBoMnYyaC0yVi00em00IDBoMnYyaC0yVi00em00IDBoMnYyaC0yVi00em00IDBoMnYyaC0yVi00em00IDBoMnYyaC0yVi00em00IDBoMnYyaC0yVi00em00IDBoMnYyaC0yVi00em0tMjggOGgydjJoLTJ2LTJ6bTggMGgydjJoLTJ2LTJ6bTggMGgydjJoLTJ2LTJ6bTggMGgydjJoLTJ2LTJ6bTggMGgydjJoLTJ2LTJ6bS00LTRoMnYyaC0yVjB6bS04IDBoMnYyaC0yVjB6bS04IDBoMnYyaC0yVjB6bS04IDBoMnYyaC0yVjB6bS04IDBoMnYyaC0yVjB6bTggMTJoMnYyaC0ydi0yek0yNCAwdjJoLTJWMGgyem0wIDRoMnYyaC0yVjR6bS00LTRoMnYyaC0yVjB6bTAgOGgydjJoLTJ2LTJ6bS00LThoMnYyaC0yVjB6bTAgOGgydjJoLTJ2LTJ6bS00LThoMnYyaC0yVjB6bTAgOGgydjJoLTJ2LTJ6bS00LThoMnYyaC0yVjB6bTAgOGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"
			></div>
		{/if}
	</div>

	{#if visible}
		<div in:fade={{ duration: 600 }} class="relative z-10 w-full max-w-md px-4 sm:px-0">
			<!-- Logo and header -->
			<div class="mb-8 text-center">
				<div
					in:scale={{ duration: 600, delay: 200, easing: elasticOut }}
					class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/10 bg-gradient-to-br from-blue-500/20 to-indigo-600/10 shadow-lg shadow-blue-500/5 backdrop-blur-sm"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-9 w-9 text-blue-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				</div>
				<h2
					in:fly={{ y: -20, duration: 600, delay: 300, easing: backOut }}
					class="mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl"
				>
					Welcome to Bluebox
				</h2>
				<p
					in:fly={{ y: -10, duration: 600, delay: 400, easing: backOut }}
					class="mx-auto max-w-xs text-sm text-gray-400 sm:text-base"
				>
					Secure, private messaging
				</p>
			</div>

			<!-- Login form with modern styling -->
			<div
				in:scale={{ duration: 600, delay: 500, start: 0.98, opacity: 0, easing: backOut }}
				class="overflow-hidden rounded-3xl border border-slate-700/20 bg-slate-800/10 shadow-2xl backdrop-blur-xl"
				style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;"
			>
				<div class="p-8">
					<!-- Error message display -->
					{#if errorMessage}
						<div 
							in:fly={{ y: -10, duration: 300, easing: backOut }}
							class="mb-6 rounded-lg bg-red-500/20 p-4 text-red-300"
						>
							<p class="flex items-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
								</svg>
								{errorMessage}
							</p>
						</div>
					{/if}
					
					<!-- Success message display -->
					{#if successMessage}
						<div 
							in:fly={{ y: -10, duration: 300, easing: backOut }}
							class="mb-6 rounded-lg bg-green-500/20 p-4 text-green-300"
						>
							<p class="flex items-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
								{successMessage}
							</p>
						</div>
					{/if}
					
					<form on:submit|preventDefault={handleSubmit} class="space-y-6">
						<!-- User ID input with modern styling -->
						<div>
							<label
								for="userId"
								class="mb-2 block text-sm font-medium text-gray-300"
								in:fly={{ y: 10, duration: 400, delay: 600, easing: backOut }}
								style="opacity: {$formProgress};"
							>
								Username
							</label>
							<div
								class="group relative"
								in:fly={{ y: 10, duration: 400, delay: 650, easing: backOut }}
								style="opacity: {$formProgress};"
							>
								<div
									class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30 opacity-0 blur transition duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
								></div>
								<input
									id="userId"
									name="userId"
									type="text"
									required
									bind:value={userId}
									class="relative block w-full rounded-xl border border-slate-700/40 bg-slate-900/60 px-5 py-4 text-base text-gray-300 placeholder-gray-500 transition-all duration-300 focus:border-blue-500/50 focus:ring-0 focus:outline-none"
									placeholder="Enter your username"
								/>
							</div>
						</div>

						<div>
							<label
								for="password"
								class="mb-2 block text-sm font-medium text-gray-300"
								in:fly={{ y: 10, duration: 400, delay: 700, easing: backOut }}
								style="opacity: {$formProgress};"
							>
								Password
							</label>
							<div
								class="group relative"
								in:fly={{ y: 10, duration: 400, delay: 750, easing: backOut }}
								style="opacity: {$formProgress};"
							>
								<div
									class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30 opacity-0 blur transition duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
								></div>
								<div class="relative flex items-center">
									<input
										id="password"
										name="password"
										type={showPassword ? 'text' : 'password'}
										required
										bind:value={password}
										class="block w-full rounded-xl border border-slate-700/40 bg-slate-900/60 px-5 py-4 pr-12 text-base text-gray-300 placeholder-gray-500 transition-all duration-300 focus:border-blue-500/50 focus:ring-0 focus:outline-none"
										placeholder="********"
									/>
									<div class="absolute inset-y-0 right-0 flex items-center">
										<button
											type="button"
											class="flex h-full items-center px-4 text-gray-500 transition-colors duration-200 hover:text-gray-300 focus:outline-none"
											on:click={() => (showPassword = !showPassword)}
											aria-label={showPassword ? 'Hide password' : 'Show password'}
										>
											{#if showPassword}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-5 w-5"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
													/>
												</svg>
											{:else}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-5 w-5"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													/>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
													/>
												</svg>
											{/if}
										</button>
									</div>
								</div>
							</div>
						</div>

						<!-- Forgot password link with modern styling -->
						<div
							class="flex justify-end"
							in:fly={{ y: 10, duration: 400, delay: 800, easing: backOut }}
							style="opacity: {$formProgress};"
						>
							<a
								href="/forgot-password"
								class="text-sm text-blue-400 transition-colors duration-200 hover:text-blue-300 hover:underline"
							>
								Forgot password?
							</a>
						</div>

						<!-- Submit button with modern styling -->
						<div
							in:fly={{ y: 10, duration: 400, delay: 850, easing: backOut }}
							style="opacity: {$formProgress};"
						>
							<button
								type="submit"
								disabled={isLoading}
								class="group relative flex w-full items-center justify-center overflow-hidden rounded-xl p-3 text-base font-medium text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
							>
								<span
									class="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-700"
								></span>
								<span
									class="absolute right-0 bottom-0 mr-4 mb-32 block h-64 w-64 origin-bottom-left translate-x-24 rotate-45 transform rounded-full bg-blue-400 opacity-30 transition-all duration-500 ease-out group-hover:rotate-90"
								></span>
								<span class="relative flex items-center">
									{#if isLoading}
										<svg
											class="mr-2 -ml-1 h-5 w-5 animate-spin text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Signing in...
									{:else}
										Sign in
									{/if}
								</span>
							</button>
						</div>
					</form>
				</div>

				<!-- Sign up link with modern styling -->
				<div
					class="border-t border-slate-700/20 bg-slate-900/40 p-4 text-center"
					in:fly={{ y: 10, duration: 400, delay: 900, easing: backOut }}
					style="opacity: {$formProgress};"
				>
					<p class="text-sm text-gray-400 sm:text-base">
						Don't have an account?
						<a
							href="/signup"
							class="font-medium text-blue-400 transition-colors duration-200 hover:text-blue-300 hover:underline"
						>
							Sign up
						</a>
					</p>
				</div>
			</div>

			<!-- Security note with modern styling -->
			<div
				class="mt-6 text-center"
				in:fly={{ y: 10, duration: 400, delay: 950, easing: backOut }}
				style="opacity: {$formProgress};"
			>
				<p class="flex items-center justify-center text-xs text-gray-500 sm:text-sm">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
					End-to-end encrypted with Gun.js
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Modern animations */
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes pulse-glow {
		0%,
		100% {
			opacity: 0.5;
		}
		50% {
			opacity: 0.8;
		}
	}

	/* Ensure SVG animations work properly */
	svg {
		overflow: visible;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		input {
			font-size: 16px; /* Prevents zoom on mobile */
		}
	}

	/* Modern focus styles that work across browsers */
	:global(.js-focus-visible :focus:not(.focus-visible)) {
		outline: none;
	}

	:global(.js-focus-visible .focus-visible) {
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}
</style>