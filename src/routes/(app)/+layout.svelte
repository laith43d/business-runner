<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();

	let sidebarOpen = $state(false);

	const viewer = useQuery(api.users.viewer, {});

	// Redirect to login if not authenticated
	$effect(() => {
		if (browser && !viewer.isLoading && viewer.data === null) {
			goto('/login');
		}
	});
</script>

{#if viewer.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-muted-foreground">جاري التحميل...</div>
	</div>
{:else if viewer.data}
	<div class="flex min-h-screen">
		<Sidebar bind:open={sidebarOpen} />

		<div class="flex flex-1 flex-col">
			<Header onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} />

			<main class="flex-1 p-4 lg:p-6">
				{@render children()}
			</main>
		</div>
	</div>
{/if}

<Toaster position="top-center" dir="rtl" />
