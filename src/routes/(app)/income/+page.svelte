<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import { Plus, Search, Download, Loader2 } from 'lucide-svelte';
	import TransactionForm from '$lib/components/transactions/TransactionForm.svelte';
	import TransactionList from '$lib/components/transactions/TransactionList.svelte';
	import EditTransactionDialog from '$lib/components/transactions/EditTransactionDialog.svelte';
	import DateRangeFilter from '$lib/components/filters/DateRangeFilter.svelte';
	import { exportToCSV } from '$lib/utils/export.js';

	type Transaction = {
		_id: Id<'transactions'>;
		_creationTime: number;
		type: 'income' | 'expense';
		amount: number;
		category?: string;
		description: string;
		date: number;
		notes?: string;
		createdBy: Id<'users'>;
		createdAt: number;
		updatedAt: number;
	};

	// Filter state
	let dateFrom = $state<number | undefined>(undefined);
	let dateTo = $state<number | undefined>(undefined);
	let searchText = $state('');

	// Build query args reactively
	let queryArgs = $derived.by(() => {
		const args: {
			type: 'income';
			dateFrom?: number;
			dateTo?: number;
			searchText?: string;
		} = { type: 'income' as const };

		if (dateFrom !== undefined) args.dateFrom = dateFrom;
		if (dateTo !== undefined) args.dateTo = dateTo;
		if (searchText.trim()) args.searchText = searchText.trim();

		return args;
	});

	const transactions = useQuery(api.transactions.list, () => queryArgs);

	// Create dialog
	let createDialogOpen = $state(false);
	let isCreating = $state(false);

	// Edit dialog
	let editDialogOpen = $state(false);
	let editingTransaction = $state<Transaction | null>(null);

	const client = useConvexClient();

	async function handleCreate(data: {
		amount: number;
		description: string;
		date: number;
		notes?: string;
	}) {
		isCreating = true;
		try {
			await client.mutation(api.transactions.create, {
				type: 'income',
				...data,
			});
			toast.success('تم إضافة الإيراد بنجاح');
			createDialogOpen = false;
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء إضافة الإيراد';
			toast.error(message);
		} finally {
			isCreating = false;
		}
	}

	function handleEdit(transaction: Transaction) {
		editingTransaction = transaction;
		editDialogOpen = true;
	}

	function handleEditClose() {
		editDialogOpen = false;
		editingTransaction = null;
	}

	function handleDateChange(from: number | undefined, to: number | undefined) {
		dateFrom = from;
		dateTo = to;
	}

	// CSV Export
	let isExporting = $state(false);

	async function handleExport() {
		isExporting = true;
		try {
			const exportArgs: {
				type: 'income';
				dateFrom?: number;
				dateTo?: number;
			} = { type: 'income' as const };

			if (dateFrom !== undefined) exportArgs.dateFrom = dateFrom;
			if (dateTo !== undefined) exportArgs.dateTo = dateTo;

			const data = await client.query(api.transactions.listForExport, exportArgs);
			if (data.length === 0) {
				toast.info('لا توجد إيرادات للتصدير');
				return;
			}
			exportToCSV(data, `إيرادات-${new Date().toISOString().slice(0, 10)}.csv`);
			toast.success(`تم تصدير ${data.length} إيراد بنجاح`);
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء التصدير';
			toast.error(message);
		} finally {
			isExporting = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">الإيرادات</h1>
			<p class="mt-1 text-muted-foreground">إدارة وتتبع جميع مصادر الدخل الخاصة بعملك.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" onclick={handleExport} disabled={isExporting || (transactions.data?.length === 0)}>
				{#if isExporting}
					<Loader2 class="h-4 w-4 animate-spin" />
				{:else}
					<Download class="h-4 w-4" />
				{/if}
				تصدير CSV
			</Button>
			<Button onclick={() => (createDialogOpen = true)}>
				<Plus class="h-4 w-4" />
				إضافة إيراد
			</Button>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-end gap-4">
		<DateRangeFilter {dateFrom} {dateTo} onDateChange={handleDateChange} />

		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">بحث</Label>
			<div class="relative">
				<Search class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					bind:value={searchText}
					placeholder="بحث في الوصف..."
					class="w-[220px] pr-9"
				/>
			</div>
		</div>
	</div>

	<!-- Transaction List -->
	{#if transactions.isLoading}
		<div class="space-y-3">
			<div class="h-10 w-full animate-pulse rounded-md bg-muted"></div>
			{#each Array(5) as _}
				<div class="h-14 w-full animate-pulse rounded-md bg-muted/50"></div>
			{/each}
		</div>
	{:else if transactions.data}
		<TransactionList
			transactions={transactions.data}
			type="income"
			onEdit={handleEdit}
		/>
	{/if}
</div>

<!-- Create Income Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>إضافة إيراد جديد</Dialog.Title>
			<Dialog.Description>أدخل بيانات الإيراد الجديد</Dialog.Description>
		</Dialog.Header>

		<TransactionForm type="income" isSubmitting={isCreating} onSubmit={handleCreate} />
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Income Dialog -->
<EditTransactionDialog
	bind:open={editDialogOpen}
	transaction={editingTransaction}
	onClose={handleEditClose}
/>
