<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { elasticOut, backOut, cubicInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { writable, type Writable } from 'svelte/store';
	import { user, authError, authLoading } from '../../lib/auth-store';

	// Form fields
	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let acceptTerms = false;
	let isLoading = false;
	let visible = false;
	let showPassword = false;
	let showConfirmPassword = false;
	let errorMessage = '';
	let successMessage = '';
	
	// Password strength indicators
	let hasMinLength = false;
	let hasUpperCase = false;
	let hasLowerCase = false;
	let hasNumber = false;
	let hasSpecialChar = false;
	
	// Password strength store
	const passwordStrength: Writable<number> = writable(0);
	
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

	// Check password strength
	function checkPasswordStrength(pwd: string): number {
		hasMinLength = pwd.length >= 8;
		hasUpperCase = /[A-Z]/.test(pwd);
		hasLowerCase = /[a-z]/.test(pwd);
		hasNumber = /[0-9]/.test(pwd);
		hasSpecialChar = /[^A-Za-z0-9]/.test(pwd);
		
		// Calculate strength score (0-5)
		const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
		passwordStrength.set(score);
		
		return score;
	}

	function validateForm(): boolean {
		// Reset error message
		errorMessage = '';
		
		// Basic validation
		if (!username || !email || !password || !confirmPassword || !acceptTerms) {
			errorMessage = 'All fields are required';
			return false;
		}
		
		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			errorMessage = 'Please enter a valid email address';
			return false;
		}
		
		// Password match validation
		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return false;
		}
		
		// Password strength validation
		const strengthScore = checkPasswordStrength(password);
		if (strengthScore < 3) {
			errorMessage = 'Password is too weak. Please make it stronger.';
			return false;
		}
		
		return true;
	}

	async function handleSubmit(): Promise<void> {
		if (!validateForm()) return;

		isLoading = true;
		authLoading.set(true);
		errorMessage = '';
		
		try {
			// Create user with Gun.js
			user$.create(username, password, (ack: any) => {
				if (ack.err) {
					errorMessage = ack.err;
					authError.set(ack.err);
					isLoading = false;
					authLoading.set(false);
					return;
				}
				
				// Login after successful creation
				user$.auth(username, password, (authAck: any) => {
					if (authAck.err) {
						errorMessage = authAck.err;
						authError.set(authAck.err);
						isLoading = false;
						authLoading.set(false);
						return;
					}
					
					// Store user data
					const userData = {
						username,
						email,
						createdAt: new Date().toISOString()
					};
					
					// Save user profile data
					user$.get('profile').put(userData);
					
					// Update user store
					user.set({
						username,
						email
					});
					
					// Show success message
					successMessage = 'Account created successfully!';
					
					// Redirect to chat after a short delay
					setTimeout(() => {
						isLoading = false;
						authLoading.set(false);
						window.location.href = '/chat';
					}, 1500);
				});
			});
		} catch (error: any) {
			console.error('Signup error:', error);
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

	// Check password input for strength in real-time
	function handlePasswordInput(): void {
		checkPasswordStrength(password);
	}

	onMount(() => {
		// Initialize Gun.js
		gun = new (window as any).Gun({
			peers: ['http://192.168.1.212:8765/gun'], // Replace with your Gun server
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
					Create Your Account
				</h2>
				<p
					in:fly={{ y: -10, duration: 600, delay: 400, easing: backOut }}
					class="mx-auto max-w-xs text-sm text-gray-400 sm:text-base"
				>
					Join Bluebox for secure messaging
				</p>
			</div>

			<!-- Signup form with modern styling -->
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
						<!-- Username input -->
						<div>
							<label
								for="username"
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
									id="username"
									name="username"
									type="text"
									required
									bind:value={username}
									class="relative block w-full rounded-xl border border-slate-700/40 bg-slate-900/60 px-5 py-4 text-base text-gray-300 placeholder-gray-500 transition-all duration-300 focus:border-blue-500/50 focus:outline-none focus:ring-0"
									placeholder="Choose a username"
								/>
							</div>
						</div>

						<!-- Email input -->
						<div>
							<label
								for="email"
								class="mb-2 block text-sm font-medium text-gray-300"
								in:fly={{ y: 10, duration: 400, delay: 700, easing: backOut }}
								style="opacity: {$formProgress};"
							>
								Email
							</label>
							<div
								class="group relative"
								in:fly={{ y: 10, duration: 400, delay: 750, easing: backOut }}
								style="opacity: {$formProgress};"
							>
								<div
									class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30 opacity-0 blur transition duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
								></div>
								<input
									id="email"
									name="email"
									type="email"
									required
									bind:value={email}
									class="relative block w-full rounded-xl border border-slate-700/40 bg-slate-900/60 px-5 py-4 text-base text-gray-300 placeholder-gray-500 transition-all duration-300 focus:border-blue-500/50 focus:outline-none focus:ring-0"
									placeholder="your@email.com"
								/>
							</div>
						</div>

						<!-- Password input with strength meter -->
						<div>
							<label
								for="password"
								class="mb-2 block text-sm font-medium text-gray-300"
								in:fly={{ y: 10, duration: 400, delay: 800, easing: backOut }}
								style="opacity: {$formProgress};"
							>
								Password
							</label>
							<div
								class="group relative"
								in:fly={{ y: 10, duration: 400, delay: 850, easing: backOut }}
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
										on:input={handlePasswordInput}
										class="block w-full rounded-xl border border-slate-700/40 bg-slate-900/60 px-5 py-4 pr-12 text-base text-gray-300 placeholder-gray-500 transition-all duration-300 focus:border-blue-500/50 focus:outline-none focus:ring-0"
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
							
							<!-- Password strength meter -->
							{#if password}
								<div class="mt-2 space-y-2">
									<div class="flex w-full gap-1">
										<div class={`h-1 flex-1 rounded-full ${$passwordStrength >= 1 ? 'bg-red-500' : 'bg-gray-700'}`}></div>
										<div class={`h-1 flex-1 rounded-full ${$passwordStrength >= 2 ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
										<div class={`h-1 flex-1 rounded-full ${$passwordStrength >= 3 ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
										<div class={`h-1 flex-1 rounded-full ${$passwordStrength >= 4 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
										<div class={`h-1 flex-1 rounded-full ${$passwordStrength >= 5 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
									</div>
									<div class="text-xs text-gray-400">
										<p class={hasMinLength ? 'text-green-400' : 'text-gray-500'}>✓ At least 8 characters</p>
										<p class={hasUpperCase ? 'text-green-400' : 'text-gray-500'}>✓ At least one uppercase letter</p>
										<p class={hasLowerCase ? 'text-green-400' : 'text-gray-500'}>✓ At least one lowercase letter</p>
										<p class={hasNumber ? 'text-green-400' : 'text-gray-500'}>✓ At least one number</p>
										<p class={hasSpecialChar ? 'text-green-400' : 'text-gray-500'}>✓ At least one special character</p>
									</div>
								</div>
							{/if}
						</div>

						<!-- Confirm Password input -->
						<div>
							<label
								for="confirmPassword"
								class="mb-2 block text-sm font-medium text-gray-300"
								in:fly={{ y: 10, duration: 400, delay: 900, easing: backOut }}
								style="opacity: {$formProgress};"
							>
								Confirm Password
							</label>
							<div
								class="group relative"
								in:fly={{ y: 10, duration: 400, delay: 950, easing: backOut }}
								style="opacity: {$formProgress};"
							>
								<div
									class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30 opacity-0 blur transition duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
								></div>
								<div class="relative flex items-center">
									<input
										id="confirmPassword"
										name="confirmPassword"
										type={showConfirmPassword ? 'text' : 'password'}
										required
										bind:value={confirmPassword}
										class="block w-full rounded-xl border border-slate-700/40 bg-slate-900/60 px-5 py-4 pr-12 text-base text-gray-300 placeholder-gray-500 transition-all duration-300 focus:border-blue-500/50 focus:outline-none focus:ring-0"
										placeholder="********"
									/>
									<div class="absolute inset-y-0 right-0 flex items-center">
										<button
											type="button"
											class="flex h-full items-center px-4 text-gray-500 transition-colors duration-200 hover:text-gray-300 focus:outline-none"
											on:click={() => (showConfirmPassword = !showConfirmPassword)}
											aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
										>
											{#if showConfirmPassword}
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
							
							<!-- Password match indicator -->
							{#if confirmPassword && password}
								<div class="mt-2">
									<p class={password === confirmPassword ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
										{password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
									</p>
								</div>
							{/if}
						</div>

						<!-- Terms and conditions checkbox -->
						<div
							class="flex items-start"
							in:fly={{ y: 10, duration: 400, delay: 1000, easing: backOut }}
							style="opacity: {$formProgress};"
						>
							<div class="flex h-5 items-center">
								<input
									id="terms"
									name="terms"
									type="checkbox"
									bind:checked={acceptTerms}
									class="h-5 w-5 rounded border-slate-700/40 bg-slate-900/60 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
								/>
							</div>
							<div class="ml-3 text-sm">
								<label for="terms" class="cursor-pointer text-gray-300">
									I agree to the <a
										href="/terms"
										class="text-blue-400 transition-colors duration-200 hover:text-blue-300 hover:underline"
										>Terms of Service</a
									> and <a
										href="/privacy"
										class="text-blue-400 transition-colors duration-200 hover:text-blue-300 hover:underline"
										>Privacy Policy</a
									>
								</label>
							</div>
						</div>

						<!-- Submit button with modern styling -->
						<div
							in:fly={{ y: 10, duration: 400, delay: 1050, easing: backOut }}
							style="opacity: {$formProgress};"
						>
							<button
								type="submit"
								disabled={isLoading || !acceptTerms}
								class="group relative flex w-full items-center justify-center overflow-hidden rounded-xl p-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
							>
								<span
									class="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-700"
								></span>
								<span
									class="absolute right-0 bottom-0 mb-32 mr-4 block h-64 w-64 origin-bottom-left translate-x-24 rotate-45 transform rounded-full bg-blue-400 opacity-30 transition-all duration-500 ease-out group-hover:rotate-90"
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
										Creating account...
									{:else}
										Create Account
									{/if}
								</span>
							</button>
						</div>
					</form>
				</div>

				<!-- Login link with modern styling -->
				<div
					class="border-t border-slate-700/20 bg-slate-900/40 p-4 text-center"
					in:fly={{ y: 10, duration: 400, delay: 1100, easing: backOut }}
					style="opacity: {$formProgress};"
				>
					<p class="text-sm text-gray-400 sm:text-base">
						Already have an account?
						<a
							href="/login"
							class="font-medium text-blue-400 transition-colors duration-200 hover:text-blue-300 hover:underline"
						>
							Sign in
						</a>
					</p>
				</div>
			</div>

			<!-- Security note with modern styling -->
			<div
				class="mt-6 text-center"
				in:fly={{ y: 10, duration: 400, delay: 1150, easing: backOut }}
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