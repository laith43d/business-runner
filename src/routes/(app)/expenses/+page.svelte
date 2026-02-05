<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
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
	let categoryFilter = $state('');

	// Load categories for filter dropdown
	const categories = useQuery(api.expenseCategories.list, {});

	// Build query args reactively
	let queryArgs = $derived.by(() => {
		const args: {
			type: 'expense';
			dateFrom?: number;
			dateTo?: number;
			category?: string;
			searchText?: string;
		} = { type: 'expense' as const };

		if (dateFrom !== undefined) args.dateFrom = dateFrom;
		if (dateTo !== undefined) args.dateTo = dateTo;
		if (categoryFilter) args.category = categoryFilter;
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
		category?: string;
		notes?: string;
	}) {
		isCreating = true;
		try {
			await client.mutation(api.transactions.create, {
				type: 'expense',
				...data,
			});
			toast.success('تم إضافة المصروف بنجاح');
			createDialogOpen = false;
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء إضافة المصروف';
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

	function handleCategoryFilterChange(value: string) {
		categoryFilter = value === '__all__' ? '' : value;
	}

	// CSV Export
	let isExporting = $state(false);

	async function handleExport() {
		isExporting = true;
		try {
			const exportArgs: {
				type: 'expense';
				dateFrom?: number;
				dateTo?: number;
				category?: string;
			} = { type: 'expense' as const };

			if (dateFrom !== undefined) exportArgs.dateFrom = dateFrom;
			if (dateTo !== undefined) exportArgs.dateTo = dateTo;
			if (categoryFilter) exportArgs.category = categoryFilter;

			const data = await client.query(api.transactions.listForExport, exportArgs);
			if (data.length === 0) {
				toast.info('لا توجد مصروفات للتصدير');
				return;
			}
			exportToCSV(data, `مصروفات-${new Date().toISOString().slice(0, 10)}.csv`);
			toast.success(`تم تصدير ${data.length} مصروف بنجاح`);
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
			<h1 class="text-3xl font-bold">المصروفات</h1>
			<p class="mt-1 text-muted-foreground">
				إدارة وتتبع جميع مصروفات عملك مصنفة حسب الفئات.
			</p>
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
				إضافة مصروف
			</Button>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-end gap-4">
		<DateRangeFilter {dateFrom} {dateTo} onDateChange={handleDateChange} />

		<!-- Category filter -->
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">التصنيف</Label>
			<Select.Root
				type="single"
				value={categoryFilter || '__all__'}
				onValueChange={handleCategoryFilterChange}
			>
				<Select.Trigger class="w-[180px]">
					<span data-slot="select-value">
						{categoryFilter || 'الكل'}
					</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="__all__">الكل</Select.Item>
					{#if categories.data}
						{#each categories.data as cat (cat._id)}
							<Select.Item value={cat.name}>{cat.name}</Select.Item>
						{/each}
					{/if}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Search -->
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
			type="expense"
			onEdit={handleEdit}
		/>
	{/if}
</div>

<!-- Create Expense Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>إضافة مصروف جديد</Dialog.Title>
			<Dialog.Description>أدخل بيانات المصروف الجديد</Dialog.Description>
		</Dialog.Header>

		<TransactionForm type="expense" isSubmitting={isCreating} onSubmit={handleCreate} />
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Expense Dialog -->
<EditTransactionDialog
	bind:open={editDialogOpen}
	transaction={editingTransaction}
	onClose={handleEditClose}
/>
