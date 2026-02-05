<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import CategoriesTable from '$lib/components/categories/CategoriesTable.svelte';
	import CreateCategoryDialog from '$lib/components/categories/CreateCategoryDialog.svelte';
	import EditCategoryDialog from '$lib/components/categories/EditCategoryDialog.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { DatabaseZap } from 'lucide-svelte';

	const categories = useQuery(api.expenseCategories.listAll, {});
	const client = useConvexClient();

	type Category = {
		_id: Id<'expenseCategories'>;
		_creationTime: number;
		name: string;
		description?: string;
		isActive: boolean;
		createdAt: number;
	};

	let editDialogOpen = $state(false);
	let editingCategory = $state<Category | null>(null);

	let seedDialogOpen = $state(false);
	let isSeeding = $state(false);

	function handleEdit(category: Category) {
		editingCategory = category;
		editDialogOpen = true;
	}

	function handleEditClose() {
		editDialogOpen = false;
		editingCategory = null;
	}

	async function handleSeed() {
		isSeeding = true;
		try {
			const inserted = await client.mutation(api.seed.seedExpenseCategories, {});
			if (inserted > 0) {
				toast.success(`تم إضافة ${inserted} تصنيف افتراضي`);
			} else {
				toast.info('التصنيفات الافتراضية موجودة بالفعل');
			}
			seedDialogOpen = false;
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء إضافة التصنيفات';
			toast.error(message);
		} finally {
			isSeeding = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">التصنيفات</h1>
			<p class="mt-1 text-muted-foreground">إدارة تصنيفات المصروفات: إضافة، تعديل، وحذف التصنيفات.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" onclick={() => (seedDialogOpen = true)}>
				<DatabaseZap class="h-4 w-4" />
				بيانات افتراضية
			</Button>
			<CreateCategoryDialog />
		</div>
	</div>

	{#if categories.isLoading}
		<!-- Loading skeleton -->
		<div class="space-y-3">
			<div class="h-10 w-full animate-pulse rounded-md bg-muted"></div>
			{#each Array(5) as _}
				<div class="h-14 w-full animate-pulse rounded-md bg-muted/50"></div>
			{/each}
		</div>
	{:else if categories.data}
		<CategoriesTable categories={categories.data} onEdit={handleEdit} />
	{/if}

	<EditCategoryDialog
		bind:open={editDialogOpen}
		category={editingCategory}
		onClose={handleEditClose}
	/>
</div>

<!-- Seed confirmation dialog -->
<AlertDialog.Root bind:open={seedDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>إضافة تصنيفات افتراضية</AlertDialog.Title>
			<AlertDialog.Description>
				سيتم إضافة التصنيفات الافتراضية (إيجار، مرافق، رواتب، تسويق، مستلزمات، تشغيل، متفرقات). التصنيفات الموجودة بالفعل لن تتأثر.
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
					<Button {...props} disabled={isSeeding} onclick={handleSeed}>
						{#if isSeeding}
							جاري الإضافة...
						{:else}
							إضافة
						{/if}
					</Button>
				{/snippet}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
