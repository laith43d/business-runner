<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils/format.js';
	import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-svelte';

	type Props = {
		totalIncome: number;
		totalExpenses: number;
		netProfit: number;
		totalDisbursements: number;
		availableProfit: number;
		isLoading?: boolean;
	};

	let {
		totalIncome,
		totalExpenses,
		netProfit,
		totalDisbursements,
		availableProfit,
		isLoading = false,
	}: Props = $props();
</script>

{#if isLoading}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each Array(4) as _}
			<div class="h-28 animate-pulse rounded-lg border bg-muted/50"></div>
		{/each}
	</div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Total Income -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">إجمالي الإيرادات</Card.Title>
				<TrendingUp class="h-4 w-4 text-green-500" />
			</Card.Header>
			<Card.Content>
				<p class="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
			</Card.Content>
		</Card.Root>

		<!-- Total Expenses -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">إجمالي المصروفات</Card.Title>
				<TrendingDown class="h-4 w-4 text-red-500" />
			</Card.Header>
			<Card.Content>
				<p class="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
			</Card.Content>
		</Card.Root>

		<!-- Net Profit -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">صافي الربح</Card.Title>
				<DollarSign class="h-4 w-4 text-primary" />
			</Card.Header>
			<Card.Content>
				<p class="text-2xl font-bold {netProfit >= 0 ? 'text-green-600' : 'text-red-600'}">
					{formatCurrency(netProfit)}
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Available Profit -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">الأرباح المتاحة للتوزيع</Card.Title>
				<Wallet class="h-4 w-4 text-primary" />
			</Card.Header>
			<Card.Content>
				<p class="text-2xl font-bold {availableProfit >= 0 ? 'text-primary' : 'text-red-600'}">
					{formatCurrency(availableProfit)}
				</p>
				{#if totalDisbursements > 0}
					<p class="mt-1 text-xs text-muted-foreground">
						تم توزيع {formatCurrency(totalDisbursements)}
					</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
{/if}
