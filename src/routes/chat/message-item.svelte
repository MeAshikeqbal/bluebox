<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Message } from './types';

	// Props
	export let message: Message;
	export let isCurrentUser: boolean = false;
	export let isGrouped: boolean = false;

	// Local state
	let imageLoaded: Record<string, boolean> = {};
	let imageError: Record<string, boolean> = {};

	const dispatch = createEventDispatcher();

	// Format timestamp
	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Generate avatar color based on username
	function generateAvatarColor(username: string): string {
		const colors = [
			'bg-blue-500/20 text-blue-400',
			'bg-purple-500/20 text-purple-400',
			'bg-green-500/20 text-green-400',
			'bg-pink-500/20 text-pink-400',
			'bg-yellow-500/20 text-yellow-400',
			'bg-indigo-500/20 text-indigo-400',
			'bg-red-500/20 text-red-400',
			'bg-orange-500/20 text-orange-400'
		];

		// Simple hash function to get consistent color for a username
		let hash = 0;
		for (let i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + ((hash << 5) - hash);
		}

		return colors[Math.abs(hash) % colors.length];
	}

	// Get initials from username
	function getInitials(username: string): string {
		if (!username) return '?';

		const parts = username.split(/[^a-zA-Z0-9]/);
		if (parts.length > 1) {
			return (parts[0][0] + parts[1][0]).toUpperCase();
		}

		return username.substring(0, 2).toUpperCase();
	}

	// Handle image load
	function handleImageLoad(url: string) {
		imageLoaded[url] = true;
	}

	// Handle image error
	function handleImageError(url: string) {
		imageError[url] = true;
		imageLoaded[url] = true; // Prevent indefinite loading state
	}

	// Open image preview
	function openImagePreview(url: string) {
		dispatch('previewAttachment', url);
	}

	// Update the getFileType function to be more robust
	function getFileType(url: string): string {
		if (!url || typeof url !== 'string') return 'other';

		// Check for image file extensions
		if (url.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i)) return 'image';

		// Check for image URLs that might not have extensions
		if (url.includes('image/') || url.includes('/img/') || url.includes('photos')) return 'image';

		// Check for PDF files
		if (url.match(/\.pdf$/i)) return 'pdf';

		return 'other';
	}

	// Update the getAttachmentsArray function to handle all possible attachment formats
	function getAttachmentsArray(attachments: any): string[] {
		// If attachments is undefined or null, return empty array
		if (!attachments) return [];

		try {
			// If it's already an array, filter out any non-string values
			if (Array.isArray(attachments)) {
				return attachments.filter((url) => url && typeof url === 'string');
			}

			// If it's an object, extract values
			if (typeof attachments === 'object') {
				// Get all values from the object
				const urls = Object.values(attachments);

				// Filter out any non-string values
				return (urls as unknown[]).filter((url) => typeof url === 'string') as string[];
			}

			// If it's a string (single attachment), return as array
			if (typeof attachments === 'string') {
				return [attachments];
			}
		} catch (error) {
			console.error('Error processing attachments:', error);
		}

		// Default to empty array if anything goes wrong
		return [];
	}

	// Safely get attachments array with error handling
	function safeGetAttachments() {
		try {
			return getAttachmentsArray(message.attachments);
		} catch (error) {
			console.error('Error getting attachments:', error, message);
			return [];
		}
	}

	$: attachmentsArray = safeGetAttachments();

	$: imageAttachments = attachmentsArray.filter((url) => getFileType(url) === 'image');

	$: pdfAttachments = attachmentsArray.filter((url) => getFileType(url) === 'pdf');

	$: otherAttachments = attachmentsArray.filter((url) => getFileType(url) === 'other');

	// Avatar color
	$: avatarColor = generateAvatarColor(message.sender);
</script>

<div
	class={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}
>
	{#if !isCurrentUser && !isGrouped}
		<div class="mr-3 flex-shrink-0">
			<div class={`flex h-8 w-8 items-center justify-center rounded-full ${avatarColor}`}>
				{getInitials(message.sender)}
			</div>
		</div>
	{:else if !isCurrentUser && isGrouped}
		<div class="mr-3 w-8 flex-shrink-0"></div>
	{/if}

	<div class={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
		{#if !isGrouped && !isCurrentUser}
			<div class="mb-1 ml-1 text-xs text-slate-400">
				{message.sender}
			</div>
		{/if}

		<div
			class={`rounded-lg px-4 py-2 shadow-sm ${
				isCurrentUser ? 'bg-blue-500/20 text-blue-50' : 'bg-slate-800/80 text-slate-200'
			}`}
		>
			{#if message.text}
				<div class="break-words whitespace-pre-wrap">{message.text}</div>
			{/if}

			{#if imageAttachments.length > 0}
				<div
					class={`${message.text ? 'mt-2' : ''} grid gap-2 ${
						imageAttachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
					}`}
				>
					{#each imageAttachments as imageUrl, i}
						<div class="relative overflow-hidden rounded-md bg-slate-700/30">
							{#if !imageLoaded[imageUrl]}
								<div class="absolute inset-0 flex items-center justify-center">
									<div
										class="h-6 w-6 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"
									></div>
								</div>
							{/if}

							<button
								type="button"
								class="h-auto max-h-60 w-full cursor-pointer border-0 bg-transparent object-contain p-0 transition-opacity hover:opacity-90"
								on:click={() => openImagePreview(imageUrl)}
								on:keydown={(e) => e.key === 'Enter' && openImagePreview(imageUrl)}
								style={imageLoaded[imageUrl] ? '' : 'opacity: 0;'}
								aria-label="View attachment"
							>
								<img
									src={imageUrl || '/placeholder.svg'}
									alt="Attachment"
									class="h-auto w-full"
									on:load={() => handleImageLoad(imageUrl)}
									on:error={() => handleImageError(imageUrl)}
								/>
							</button>

							{#if imageError[imageUrl]}
								<div
									class="flex h-32 items-center justify-center bg-slate-700/30 text-sm text-slate-400"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="mr-1 h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clip-rule="evenodd"
										/>
									</svg>
									Failed to load image
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			{#if pdfAttachments.length > 0}
				<div class={`${message.text || imageAttachments.length > 0 ? 'mt-2' : ''} space-y-2`}>
					{#each pdfAttachments as pdfUrl}
						<div class="overflow-hidden rounded-md bg-slate-700/30">
							<div class="flex items-center justify-between border-b border-slate-600/30 p-2">
								<div class="flex items-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="mr-2 h-5 w-5 text-red-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="truncate text-sm">{pdfUrl.split('/').pop()}</span>
								</div>
								<div class="flex items-center gap-2">
									<button
										on:click={() => openImagePreview(pdfUrl)}
										class="text-blue-400 hover:text-blue-300"
										aria-label="View PDF"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
											<path
												fill-rule="evenodd"
												d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
												clip-rule="evenodd"
											/>
										</svg>
									</button>
									<a
										href={pdfUrl}
										target="_blank"
										rel="noopener noreferrer"
										download
										class="text-blue-400 hover:text-blue-300"
										aria-label="Download PDF"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fill-rule="evenodd"
												d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
												clip-rule="evenodd"
											/>
										</svg>
									</a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if otherAttachments && Array.isArray(otherAttachments) && otherAttachments.length > 0}
				<div
					class={`${message.text || imageAttachments.length > 0 || pdfAttachments.length > 0 ? 'mt-2' : ''} space-y-2`}
				>
					{#each otherAttachments as fileUrl}
						{#if fileUrl}
							<!-- Ensure fileUrl is valid -->
							<div class="flex items-center rounded bg-slate-700/30 p-2 text-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-2 h-5 w-5 text-slate-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
										clip-rule="evenodd"
									/>
								</svg>
								<span class="max-w-xs truncate" title={fileUrl.split('/').pop()}>
									{fileUrl.split('/').pop()}
								</span>
								<a
									href={fileUrl}
									target="_blank"
									rel="noopener noreferrer"
									download
									class="ml-2 text-blue-400 hover:text-blue-300"
									aria-label="Download {fileUrl.split('/').pop()}"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
											clip-rule="evenodd"
										/>
									</svg>
								</a>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
		<div class="mt-1 flex items-center text-xs text-slate-500">
			<span>{formatTime(message.timestamp)}</span>

			{#if isCurrentUser}
				<span class="ml-2 flex items-center">
					{#if message.isRead}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3 w-3 text-blue-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3 w-3"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.647 2.646a1 1 0 001.414-1.414L10.414 8H12a1 1 0 10 0-2h-2z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</span>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Component-specific styles */
	img {
		transition: opacity 0.3s ease;
	}
</style>
