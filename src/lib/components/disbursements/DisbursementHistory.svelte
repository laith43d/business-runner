<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import { Trash2 } from 'lucide-svelte';
	import { formatCurrency, formatDateShort } from '$lib/utils/format.js';

	type Disbursement = {
		_id: Id<'disbursements'>;
		_creationTime: number;
		shareholderId: Id<'shareholders'>;
		shareholderName: string;
		amount: number;
		date: number;
		period: string;
		notes?: string;
		createdBy: Id<'users'>;
		createdAt: number;
	};

	type ShareholderOption = {
		id: Id<'shareholders'>;
		name: string;
	};

	type Props = {
		disbursements: Disbursement[];
		shareholders: ShareholderOption[];
		isLoading?: boolean;
		selectedShareholderId: string;
		onShareholderFilterChange: (id: string) => void;
	};

	let {
		disbursements,
		shareholders,
		isLoading = false,
		selectedShareholderId,
		onShareholderFilterChange,
	}: Props = $props();

	let deleteTarget = $state<Disbursement | null>(null);
	let isDeleting = $state(false);

	const client = useConvexClient();

	async function handleDelete() {
		if (!deleteTarget) return;

		isDeleting = true;
		try {
			await client.mutation(api.disbursements.remove, {
				id: deleteTarget._id,
			});
			toast.success('تم حذف التوزيع بنجاح');
			deleteTarget = null;
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء حذف التوزيع';
			toast.error(message);
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">سجل التوزيعات</h2>

		<!-- Shareholder filter -->
		<div class="flex items-center gap-2">
			<Label class="text-xs text-muted-foreground">تصفية حسب الشريك</Label>
			<Select.Root
				type="single"
				value={selectedShareholderId}
				onValueChange={onShareholderFilterChange}
			>
				<Select.Trigger class="w-[180px]">
					<span data-slot="select-value">
						{selectedShareholderId === 'all'
							? 'الكل'
							: shareholders.find((s) => s.id === selectedShareholderId)?.name ?? 'الكل'}
					</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">الكل</Select.Item>
					{#each shareholders as sh (sh.id)}
						<Select.Item value={sh.id}>{sh.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	{#if isLoading}
		<div class="space-y-3">
			<div class="h-10 w-full animate-pulse rounded-md bg-muted"></div>
			{#each Array(3) as _}
				<div class="h-14 w-full animate-pulse rounded-md bg-muted/50"></div>
			{/each}
		</div>
	{:else if disbursements.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
			<p class="text-muted-foreground">لا توجد توزيعات مسجلة لهذه الفترة</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-md border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="text-right">التاريخ</Table.Head>
						<Table.Head class="text-right">الشريك</Table.Head>
						<Table.Head class="text-right">المبلغ</Table.Head>
						<Table.Head class="text-right">الفترة</Table.Head>
						<Table.Head class="text-right">ملاحظات</Table.Head>
						<Table.Head class="w-[80px] text-right">الإجراءات</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each disbursements as disbursement (disbursement._id)}
						<Table.Row>
							<Table.Cell class="whitespace-nowrap">
								{formatDateShort(disbursement.date)}
							</Table.Cell>
							<Table.Cell class="font-medium">
								{disbursement.shareholderName}
							</Table.Cell>
							<Table.Cell class="whitespace-nowrap font-medium">
								{formatCurrency(disbursement.amount)}
							</Table.Cell>
							<Table.Cell dir="ltr" class="text-right">
								{disbursement.period}
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">
								{disbursement.notes || '—'}
							</Table.Cell>
							<Table.Cell>
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => (deleteTarget = disbursement)}
									title="حذف"
									class="text-destructive hover:text-destructive"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>

<!-- Delete confirmation dialog -->
<AlertDialog.Root
	open={deleteTarget !== null}
	onOpenChange={(v) => { if (!v) deleteTarget = null; }}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>هل أنت متأكد من حذف هذا التوزيع؟</AlertDialog.Title>
			<AlertDialog.Description>
				سيتم حذف توزيع {deleteTarget ? formatCurrency(deleteTarget.amount) : ''} للشريك "{deleteTarget?.shareholderName}" بشكل نهائي.
				سيتم إعادة المبلغ إلى الأرباح المتاحة.
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
