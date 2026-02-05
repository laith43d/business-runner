<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import { formatCurrency, formatDateShort } from '$lib/utils/format.js';

	type TransactionType = 'income' | 'expense';

	type Transaction = {
		_id: Id<'transactions'>;
		_creationTime: number;
		type: TransactionType;
		amount: number;
		category?: string;
		description: string;
		date: number;
		notes?: string;
		createdBy: Id<'users'>;
		createdAt: number;
		updatedAt: number;
	};

	type Props = {
		transactions: Transaction[];
		type: TransactionType;
		onEdit: (transaction: Transaction) => void;
		hasMore?: boolean;
		onLoadMore?: () => void;
		isLoadingMore?: boolean;
	};

	let { transactions, type, onEdit, hasMore = false, onLoadMore, isLoadingMore = false }: Props =
		$props();

	let deleteTarget = $state<Transaction | null>(null);
	let isDeleting = $state(false);

	const client = useConvexClient();

	async function handleDelete() {
		if (!deleteTarget) return;

		isDeleting = true;
		try {
			await client.mutation(api.transactions.remove, {
				id: deleteTarget._id,
			});
			toast.success('تم حذف المعاملة بنجاح');
			deleteTarget = null;
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء حذف المعاملة';
			toast.error(message);
		} finally {
			isDeleting = false;
		}
	}
</script>

{#if transactions.length === 0}
	<div
		class="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center"
	>
		<p class="text-lg font-medium text-muted-foreground">
			{type === 'income' ? 'لا توجد إيرادات' : 'لا توجد مصروفات'}
		</p>
		<p class="mt-1 text-sm text-muted-foreground">
			{type === 'income' ? 'أضف أول إيراد لتتبع دخلك' : 'أضف أول مصروف لتتبع نفقاتك'}
		</p>
	</div>
{:else}
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-right">التاريخ</Table.Head>
					<Table.Head class="text-right">المبلغ</Table.Head>
					{#if type === 'expense'}
						<Table.Head class="text-right">التصنيف</Table.Head>
					{/if}
					<Table.Head class="text-right">الوصف</Table.Head>
					<Table.Head class="text-right">ملاحظات</Table.Head>
					<Table.Head class="w-[120px] text-right">الإجراءات</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each transactions as transaction (transaction._id)}
					<Table.Row>
						<Table.Cell class="whitespace-nowrap">
							{formatDateShort(transaction.date)}
						</Table.Cell>
						<Table.Cell class="whitespace-nowrap font-medium">
							{formatCurrency(transaction.amount)}
						</Table.Cell>
						{#if type === 'expense'}
							<Table.Cell>{transaction.category || '—'}</Table.Cell>
						{/if}
						<Table.Cell>{transaction.description}</Table.Cell>
						<Table.Cell class="text-muted-foreground">
							{transaction.notes || '—'}
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => onEdit(transaction)}
									title="تعديل"
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => (deleteTarget = transaction)}
									title="حذف"
									class="text-destructive hover:text-destructive"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	{#if hasMore && onLoadMore}
		<div class="flex justify-center pt-4">
			<Button variant="outline" onclick={onLoadMore} disabled={isLoadingMore}>
				{#if isLoadingMore}
					جاري التحميل...
				{:else}
					تحميل المزيد
				{/if}
			</Button>
		</div>
	{/if}
{/if}

<!-- Delete confirmation dialog -->
<AlertDialog.Root
	open={deleteTarget !== null}
	onOpenChange={(v) => {
		if (!v) deleteTarget = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>هل أنت متأكد من حذف هذه المعاملة؟</AlertDialog.Title>
			<AlertDialog.Description>
				سيتم حذف المعاملة "{deleteTarget?.description}" بشكل نهائي ولا يمكن التراجع عن هذا
				الإجراء.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>
				{#snippet child({ props })}
					<Button {...props} variant="outline">إلغاء</Button>
				{/snippet}
			</AlertDialog.Cancel>
			<AlertDialog.Action>
				{#snippet child({ props })}
					<Button {...props} variant="destructive" disabled={isDeleting} onclick={handleDelete}>
						{#if isDeleting}
							جاري الحذف...
						{:else}
							حذف
						{/if}
					</Button>
				{/snippet}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
