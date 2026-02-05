<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { cn } from '$lib/utils/index.js';
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		value: string;
		subtitle?: string;
		icon: any;
		iconColor?: string;
		valueColor?: string;
		loading?: boolean;
	};

	let {
		label,
		value,
		subtitle,
		icon: Icon,
		iconColor = 'text-muted-foreground',
		valueColor = '',
		loading = false,
	}: Props = $props();
</script>

<Card.Root class="relative overflow-hidden">
	<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
		<Card.Description class="text-sm font-medium">{label}</Card.Description>
		<div class={cn('h-5 w-5 shrink-0', iconColor)}>
			<Icon class="h-5 w-5" />
		</div>
	</Card.Header>
	<Card.Content>
		{#if loading}
			<div class="space-y-2">
				<div class="h-7 w-32 animate-pulse rounded bg-muted"></div>
				{#if subtitle !== undefined}
					<div class="h-4 w-20 animate-pulse rounded bg-muted"></div>
				{/if}
			</div>
		{:else}
			<div class={cn('text-2xl font-bold', valueColor)}>{value}</div>
			{#if subtitle}
				<p class="mt-1 text-xs text-muted-foreground">{subtitle}</p>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
