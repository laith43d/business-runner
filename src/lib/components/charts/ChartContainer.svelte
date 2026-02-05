<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		loading?: boolean;
		empty?: boolean;
		emptyMessage?: string;
		class?: string;
		children: Snippet;
	};

	let {
		title,
		loading = false,
		empty = false,
		emptyMessage = 'لا توجد بيانات',
		class: className = '',
		children,
	}: Props = $props();
</script>

<div class="rounded-xl border bg-card p-4 shadow-sm {className}">
	<h3 class="mb-4 text-sm font-semibold text-muted-foreground">{title}</h3>

	{#if loading}
		<div class="flex h-64 items-center justify-center">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
		</div>
	{:else if empty}
		<div class="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
			</svg>
			<p class="text-sm">{emptyMessage}</p>
		</div>
	{:else}
		{@render children()}
	{/if}
</div>
