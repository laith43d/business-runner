<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { toast } from 'svelte-sonner';
	import { Pencil, Trash2 } from 'lucide-svelte';

	type Category = {
		_id: Id<'expenseCategories'>;
		_creationTime: number;
		name: string;
		description?: string;
		isActive: boolean;
		createdAt: number;
	};

	type Props = {
		categories: Category[];
		onEdit: (category: Category) => void;
	};

	let { categories, onEdit }: Props = $props();

	let deleteTarget = $state<Category | null>(null);
	let isDeleting = $state(false);

	const client = useConvexClient();

	async function handleDeactivate() {
		if (!deleteTarget) return;

		isDeleting = true;
		try {
			await client.mutation(api.expenseCategories.deactivate, {
				id: deleteTarget._id,
			});
			toast.success('تم حذف الفئة بنجاح');
			deleteTarget = null;
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء حذف الفئة';
			toast.error(message);
		} finally {
			isDeleting = false;
		}
	}
</script>

{#if categories.length === 0}
	<div class="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
		<p class="text-lg font-medium text-muted-foreground">لا توجد تصنيفات</p>
		<p class="mt-1 text-sm text-muted-foreground">أضف أول تصنيف للمصروفات</p>
	</div>
{:else}
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-right">الاسم</Table.Head>
					<Table.Head class="text-right">الوصف</Table.Head>
					<Table.Head class="text-right">الحالة</Table.Head>
					<Table.Head class="text-right w-[120px]">الإجراءات</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each categories as category (category._id)}
					<Table.Row>
						<Table.Cell class="font-medium">{category.name}</Table.Cell>
						<Table.Cell class="text-muted-foreground">
							{category.description || '—'}
						</Table.Cell>
						<Table.Cell>
							{#if category.isActive}
								<Badge variant="default">نشط</Badge>
							{:else}
								<Badge variant="secondary">غير نشط</Badge>
							{/if}
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => onEdit(category)}
									title="تعديل"
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => (deleteTarget = category)}
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
{/if}

<!-- Delete confirmation dialog -->
<AlertDialog.Root
	open={deleteTarget !== null}
	onOpenChange={(v) => { if (!v) deleteTarget = null; }}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>هل أنت متأكد من حذف هذه الفئة؟</AlertDialog.Title>
			<AlertDialog.Description>
				سيتم إلغاء تفعيل الفئة "{deleteTarget?.name}" ولن تظهر في القوائم بعد الآن.
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
							حذف
						{/if}
					</Button>
				{/snippet}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
