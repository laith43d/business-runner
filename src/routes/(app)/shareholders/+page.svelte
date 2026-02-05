<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import ShareholderCard from '$lib/components/shareholders/ShareholderCard.svelte';
	import CreateShareholderDialog from '$lib/components/shareholders/CreateShareholderDialog.svelte';
	import EditShareholderDialog from '$lib/components/shareholders/EditShareholderDialog.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';

	const shareholders = useQuery(api.shareholders.list, {});
	const totalPercentage = useQuery(api.shareholders.getTotalPercentage, {});
	const client = useConvexClient();

	type Shareholder = {
		_id: Id<'shareholders'>;
		_creationTime: number;
		name: string;
		email: string;
		sharePercentage: number;
		isActive: boolean;
		createdAt: number;
		updatedAt: number;
	};

	let editDialogOpen = $state(false);
	let editingShareholder = $state<Shareholder | null>(null);
	let deleteTarget = $state<Shareholder | null>(null);
	let isDeleting = $state(false);

	// Derive totals from the query
	let total = $derived(totalPercentage.data?.total ?? 0);
	let remaining = $derived(totalPercentage.data?.remaining ?? 100);

	// Progress bar color based on total
	let progressColor = $derived(
		total === 100 ? 'bg-green-500' : total > 100 ? 'bg-red-500' : 'bg-yellow-500',
	);

	function handleEdit(shareholder: Shareholder) {
		editingShareholder = shareholder;
		editDialogOpen = true;
	}

	function handleEditClose() {
		editDialogOpen = false;
		editingShareholder = null;
	}

	function handleDeactivateRequest(shareholder: Shareholder) {
		deleteTarget = shareholder;
	}

	async function handleDeactivate() {
		if (!deleteTarget) return;

		isDeleting = true;
		try {
			await client.mutation(api.shareholders.deactivate, {
				id: deleteTarget._id,
			});
			toast.success(`تم إلغاء تفعيل الشريك "${deleteTarget.name}" بنجاح`);
			deleteTarget = null;
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء إلغاء تفعيل الشريك';
			toast.error(message);
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">الشركاء</h1>
			<p class="mt-1 text-muted-foreground">إدارة بيانات الشركاء ونسب الملكية.</p>
		</div>
		<CreateShareholderDialog {remaining} />
	</div>

	<!-- Summary Bar -->
	{#if totalPercentage.data}
		<div class="rounded-lg border bg-card p-4 shadow-sm">
			<div class="mb-3 flex items-center justify-between text-sm">
				<span class="font-medium">إجمالي النسب: <span class="text-lg font-bold">{total}%</span></span>
				<span class="text-muted-foreground">المتبقي: <span class="font-semibold">{remaining}%</span></span>
			</div>
			<div class="h-3 w-full overflow-hidden rounded-full bg-muted">
				<div
					class="h-full rounded-full transition-all duration-500 {progressColor}"
					style="width: {Math.min(total, 100)}%"
				></div>
			</div>
			{#if total === 100}
				<p class="mt-2 text-sm text-green-600">تم توزيع جميع النسب بالكامل</p>
			{:else if total > 100}
				<p class="mt-2 text-sm text-red-600">تحذير: إجمالي النسب يتجاوز 100%</p>
			{:else}
				<p class="mt-2 text-sm text-muted-foreground">يتبقى {remaining}% للتوزيع</p>
			{/if}
		</div>
	{/if}

	<!-- Shareholders Grid -->
	{#if shareholders.isLoading}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(3) as _}
				<div class="h-48 animate-pulse rounded-lg border bg-muted/50"></div>
			{/each}
		</div>
	{:else if shareholders.data && shareholders.data.length > 0}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each shareholders.data as shareholder (shareholder._id)}
				<ShareholderCard
					{shareholder}
					onEdit={handleEdit}
					onDeactivate={handleDeactivateRequest}
				/>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
			<p class="text-lg font-medium text-muted-foreground">لم يتم إضافة أي شركاء بعد</p>
			<p class="mt-1 text-sm text-muted-foreground">أضف أول شريك لبدء توزيع الأرباح</p>
		</div>
	{/if}
</div>

<!-- Edit Shareholder Dialog -->
<EditShareholderDialog
	bind:open={editDialogOpen}
	shareholder={editingShareholder}
	totalRemaining={remaining}
	onClose={handleEditClose}
/>

<!-- Deactivate Confirmation Dialog -->
<AlertDialog.Root
	open={deleteTarget !== null}
	onOpenChange={(v) => { if (!v) deleteTarget = null; }}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>هل أنت متأكد من إلغاء تفعيل هذا الشريك؟</AlertDialog.Title>
			<AlertDialog.Description>
				سيتم إلغاء تفعيل الشريك "{deleteTarget?.name}" وسيتم تحرير نسبته البالغة {deleteTarget?.sharePercentage}% لإعادة توزيعها.
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
					<Button {...props} variant="destructive" disabled={isDeleting} onclick={handleDeactivate}>
						{#if isDeleting}
							جاري الحذف...
						{:else}
							إلغاء التفعيل
						{/if}
					</Button>
				{/snippet}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
