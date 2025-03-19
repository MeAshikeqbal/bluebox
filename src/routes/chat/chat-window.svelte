<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getGun, user } from '$lib/auth-store';
	import MessageInput from './message-input.svelte';
	import MessageList from './message-list.svelte';
	import { ENV } from '$lib/env-config';
	import type { Message, ChatRoom } from './types';

	// Props
	export let roomId: string;
	export let roomName: string;

	// Reactive variables
	let messages: Message[] = [];
	let messageText: string = '';
	let roomData: ChatRoom | null = null;
	let activeUsers: number = 0;
	let isLoading: boolean = true;
	let error: string = '';
	let gun: any;
	let messagesRef: any;
	let heartbeatInterval: any;
	let previewAttachment: string | null = null;
	let showAttachmentPreview: boolean = false;
	let messageListElement: HTMLElement;
	let isAtBottom: boolean = true;
	let unreadCount: number = 0;

	// Functions
	async function sendMessage(text: string, attachments?: { [key: string]: string }) {
		if ((!text || !text.trim()) && (!attachments || Object.keys(attachments || {}).length === 0))
			return;
		if (!$user) {
			error = 'You must be logged in to send messages';
			return;
		}

		try {
			const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			// Process attachments to ensure they're in a valid format
			let processedAttachments: { [key: string]: string } = {};
			if (attachments && typeof attachments === 'object') {
				// Filter out any invalid attachments
				Object.entries(attachments).forEach(([key, value]) => {
					if (value && typeof value === 'string') {
						processedAttachments[key] = value;
					}
				});
			}

			const newMessage: Message = {
				id: messageId,
				text: text.trim(),
				sender: $user.username,
				timestamp: Date.now(),
				isRead: false
			};

			// Only add attachments if there are any
			if (Object.keys(processedAttachments).length > 0) {
				newMessage.attachments = processedAttachments;
			}

			// First put the message without attachments to avoid potential issues
			messagesRef.get(messageId).put(newMessage);

			// Update room's last message
			if (roomData) {
				gun
					.get('chatRooms')
					.get(roomId)
					.put({
						lastMessage: {
							text: text.length > 30 ? text.substring(0, 30) + '...' : text,
							sender: $user.username,
							timestamp: newMessage.timestamp
						},
						updatedAt: newMessage.timestamp
					});
			}

			// Scroll to bottom
			setTimeout(() => {
				scrollToBottom();
			}, 100);
		} catch (err) {
			console.error('Error sending message:', err);
			error = `Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`;
		}
	}

	function leaveChat() {
		if ($user && gun) {
			gun.get('chatRooms').get(roomId).get('members').get($user.username).put({
				active: false,
				lastActive: Date.now()
			});
		}
	}

	function countActiveUsers() {
		if (!roomData || !roomData.members) return 0;

		// Consider a user active if they've been active in the last 5 minutes
		const activeTimeThreshold = Date.now() - 5 * 60 * 1000;

		let count = 0;

		// Iterate through members and count active ones
		Object.entries(roomData.members).forEach(([username, member]) => {
			if (
				member &&
				((typeof member.active === 'boolean' && member.active === true) ||
					(typeof member.lastActive === 'number' && member.lastActive > activeTimeThreshold))
			) {
				count++;
			}
		});

		return count;
	}

	function debugRoomMembers() {
		if (!roomData || !roomData.members) {
			console.log('No room data or members available');
			return;
		}

		console.log('Room members:', roomData.members);

		const activeTimeThreshold = Date.now() - 5 * 60 * 1000;
		const activeMembers = Object.entries(roomData.members).filter(
			([username, member]) =>
				member &&
				((typeof member.active === 'boolean' && member.active === true) ||
					(typeof member.lastActive === 'number' && member.lastActive > activeTimeThreshold))
		);

		console.log('Active members:', activeMembers);
		console.log('Active count:', activeMembers.length);
	}

	function handleSendMessage(
		event: CustomEvent<{ text: string; attachments?: { [key: string]: string } }>
	) {
		const { text, attachments } = event.detail;
		sendMessage(text, attachments);
	}

	// Handle attachment preview
	function handleAttachmentPreview(event: { detail: string | null }) {
		previewAttachment = event.detail;
		showAttachmentPreview = true;
	}

	// Close attachment preview
	function closeAttachmentPreview() {
		showAttachmentPreview = false;
		setTimeout(() => {
			previewAttachment = null;
		}, 300);
	}

	// Function to handle scroll events
	function handleScroll(e: { target: any }) {
		const target = e.target;
		if (!target) return;

		const { scrollTop, scrollHeight, clientHeight } = target;

		// Check if scrolled to bottom
		isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;

		// Mark messages as read when scrolled to bottom
		if (isAtBottom && messagesRef && $user) {
			markMessagesAsRead();
		}
	}

	// Function to mark messages as read
	function markMessagesAsRead() {
		if (!$user || !messagesRef) return;

		messages.forEach((msg) => {
			if (!msg.isRead && msg.sender !== $user?.username) {
				// Update in Gun.js
				messagesRef.get(msg.id).put({ isRead: true });
			}
		});

		// Update last read timestamp
		if (roomData && gun && $user) {
			gun.get('chatRooms').get(roomId).get('members').get($user.username).put({
				lastRead: Date.now()
			});
		}

		// Reset unread count
		unreadCount = 0;
	}

	// Function to scroll to bottom
	function scrollToBottom() {
		if (messageListElement) {
			messageListElement.scrollTop = messageListElement.scrollHeight;
			isAtBottom = true;

			// Mark messages as read
			if (messagesRef && $user) {
				markMessagesAsRead();
			}
		}
	}

	async function initChat() {
		const { gun: gunInstance } = getGun();
		gun = gunInstance;

		if (!gun) {
			error = 'Failed to initialize chat. Please try again.';
			isLoading = false;
			return;
		}

		// Load initial room data
		gun
			.get('chatRooms')
			.get(roomId)
			.once((room: ChatRoom | null) => {
				if (room) {
					roomData = room;
					activeUsers = countActiveUsers();
					debugRoomMembers();

					// Set up listener for room data changes to update active users
					gun
						.get('chatRooms')
						.get(roomId)
						.on((updatedRoom: ChatRoom | null) => {
							if (updatedRoom) {
								roomData = updatedRoom;
								// Force recalculation of active users
								activeUsers = countActiveUsers();
								console.log('Updated active users count:', activeUsers);
							}
						});

					// Get messages reference
					messagesRef = gun.get('chatMessages').get(roomId);

					// Subscribe to messages with real-time updates
					messagesRef
						.map()
						.on(
							(
								msg: {
									id: any;
									text: any;
									sender: string | undefined;
									timestamp: any;
									isRead: any;
									attachments: string[] | { [key: string]: string } | undefined;
								},
								id: string
							) => {
								if (!msg || !id) return;

								try {
									// Add ID to message if not present
									if (!msg.id) {
										msg.id = id;
										messagesRef.get(id).put({ id });
									}

									// Ensure message has all required fields
									const validMessage: Message = {
										id: msg.id || id,
										text: msg.text || '',
										sender: msg.sender || 'Unknown',
										timestamp: msg.timestamp || Date.now(),
										isRead: msg.isRead || false
									};

									// Only add attachments if they exist
									if (msg.attachments) {
										validMessage.attachments = msg.attachments;
									}

									// Update messages array
									messages = [...messages.filter((m) => m.id !== id), validMessage].sort(
										(a, b) => a.timestamp - b.timestamp
									);

									// Increment unread count if not at bottom and not from current user
									if (!isAtBottom && msg.sender !== $user?.username && !msg.isRead) {
										unreadCount++;
									}

									// If at bottom, mark as read
									if (isAtBottom && msg.sender !== $user?.username && !msg.isRead) {
										setTimeout(() => {
											messagesRef.get(id).put({ isRead: true });
										}, 500);
									}

									// Auto-scroll to bottom for new messages if we're already at the bottom
									if (isAtBottom) {
										setTimeout(() => {
											scrollToBottom();
										}, 100);
									}
								} catch (error) {
									console.error('Error processing message:', error, msg);
								}
							}
						);

					// Add user to the room's member list if logged in
					if ($user) {
						gun.get('chatRooms').get(roomId).get('members').get($user.username).put({
							active: true,
							lastActive: Date.now(),
							lastRead: Date.now(),
							joined: Date.now()
						});
					}

					// Set up presence heartbeat
					heartbeatInterval = setInterval(() => {
						if ($user && gun) {
							// Update user's active status
							gun.get('chatRooms').get(roomId).get('members').get($user.username).put({
								active: true,
								lastActive: Date.now()
							});

							// Force recalculation of active users
							if (roomData) {
								activeUsers = countActiveUsers();
								console.log('Heartbeat active users count:', activeUsers);
							}
						}
					}, 30000); // Every 30 seconds

					isLoading = false;
					error = '';

					// Scroll to bottom after messages load
					setTimeout(() => {
						scrollToBottom();
					}, 300);
				} else {
					// Create room if it doesn't exist
					const newRoom: ChatRoom = {
						id: roomId,
						name: roomName,
						createdAt: Date.now(),
						updatedAt: Date.now(),
						members: {},
						lastMessage: null
					};

					if ($user) {
						newRoom.members[$user.username] = {
							joined: Date.now(),
							lastRead: Date.now(),
							active: true,
							lastActive: Date.now()
						};
					}

					gun.get('chatRooms').get(roomId).put(newRoom);
					roomData = newRoom;
					activeUsers = $user ? 1 : 0;

					// Get messages reference
					messagesRef = gun.get('chatMessages').get(roomId);
					isLoading = false;
					error = '';
				}
			});
	}

	onMount(() => {
		initChat();
	});

	onDestroy(() => {
		if (heartbeatInterval) {
			clearInterval(heartbeatInterval);
		}
		leaveChat();
	});
</script>

<div
	class="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700/20 bg-slate-900"
>
	<!-- Chat header -->
	<div
		class="flex items-center justify-between border-b border-slate-700/20 bg-slate-800/50 px-4 py-3"
	>
		<div class="flex items-center">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
					<path
						d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"
					/>
				</svg>
			</div>
			<div class="ml-3">
				<h2 class="text-lg font-semibold text-white">{roomName}</h2>
				<p class="text-xs text-slate-400">
					{activeUsers} active
				</p>
			</div>
		</div>
	</div>

	<!-- Chat messages -->
	<div
		class="flex-1 space-y-4 overflow-y-auto p-4"
		bind:this={messageListElement}
		on:scroll={handleScroll}
	>
		{#if isLoading}
			<div class="flex h-full items-center justify-center">
				<div class="flex animate-pulse flex-col items-center">
					<div class="h-12 w-12 rounded-full bg-blue-500/20"></div>
					<div class="mt-2 text-sm text-slate-400">Loading messages...</div>
				</div>
			</div>
		{:else if error}
			<div class="flex h-full items-center justify-center">
				<div class="max-w-md rounded-lg bg-red-500/20 p-4 text-center text-red-300">
					<p>{error}</p>
					<button
						class="mt-2 rounded-md bg-red-500/30 px-4 py-2 text-sm font-medium hover:bg-red-500/40"
						on:click={() => {
							error = '';
							initChat();
						}}
					>
						Try Again
					</button>
				</div>
			</div>
		{:else}
			<MessageList
				{messages}
				currentUser={$user?.username || ''}
				on:previewAttachment={handleAttachmentPreview}
			/>

			{#if !isAtBottom && unreadCount > 0}
				<button
					class="fixed bottom-24 left-1/2 -translate-x-1/2 transform cursor-pointer rounded-full bg-blue-500 px-4 py-2 text-white shadow-lg"
					on:click={scrollToBottom}
				>
					<div class="flex items-center">
						<span class="mr-2">{unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
				</button>
			{/if}
		{/if}
	</div>

	<!-- Message input -->
	<div class="border-t border-slate-700/20 bg-slate-800/30 p-4">
		<MessageInput on:sendMessage={handleSendMessage} disabled={!$user || isLoading || !!error} />

		{#if !$user}
			<div class="mt-2 text-center text-sm text-red-300">
				You must be logged in to send messages
			</div>
		{/if}
	</div>
</div>

<!-- Attachment preview modal -->
{#if showAttachmentPreview && previewAttachment}
	<div 
		role="dialog"
		aria-modal="true"
		aria-label="Attachment Preview"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
		on:keydown={(e) => e.key === 'Escape' && closeAttachmentPreview()}
		tabindex="0"
	>
		<button
			class="absolute inset-0 w-full h-full bg-transparent"
			on:click={closeAttachmentPreview}
			aria-label="Close preview"
		></button>

		<div class="relative max-h-[90vh] max-w-4xl z-10">
			{#if previewAttachment.match(/\.(jpeg|jpg|gif|png|webp)$/i)}
				<img
					src={previewAttachment || '/placeholder.svg'}
					alt="Full size preview"
					class="max-h-[90vh] max-w-full object-contain"
				/>
			{:else if previewAttachment.match(/\.pdf$/i)}
				<div class="rounded-lg bg-white p-2">
					<iframe src={previewAttachment} title="PDF Preview" class="h-[80vh] w-full"></iframe>
				</div>
			{/if}

			<button
				class="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
				on:click={closeAttachmentPreview}
				aria-label="Close preview"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar for Webkit browsers */
	::-webkit-scrollbar {
		width: 6px;
	}
	::-webkit-scrollbar-track {
		background: rgba(15, 23, 42, 0.1);
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb {
		background: rgba(148, 163, 184, 0.2);
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: rgba(148, 163, 184, 0.3);
	}
</style>
