<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import TransactionForm from './TransactionForm.svelte';

	type TransactionType = 'income' | 'expense';

	type Transaction = {
		_id: Id<'transactions'>;
		type: TransactionType;
		amount: number;
		category?: string;
		description: string;
		date: number;
		notes?: string;
	};

	type Props = {
		open: boolean;
		transaction: Transaction | null;
		onClose: () => void;
	};

	let { open = $bindable(), transaction, onClose }: Props = $props();

	let isSubmitting = $state(false);

	const client = useConvexClient();

	async function handleSubmit(data: {
		amount: number;
		description: string;
		date: number;
		category?: string;
		notes?: string;
	}) {
		if (!transaction) return;

		isSubmitting = true;
		try {
			await client.mutation(api.transactions.update, {
				id: transaction._id,
				amount: data.amount,
				description: data.description,
				date: data.date,
				category: data.category,
				notes: data.notes,
			});
			toast.success('تم تعديل المعاملة بنجاح');
			onClose();
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء تعديل المعاملة';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) onClose();
	}}
>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>
				{transaction?.type === 'income' ? 'تعديل الإيراد' : 'تعديل المصروف'}
			</Dialog.Title>
			<Dialog.Description>تعديل بيانات المعاملة</Dialog.Description>
		</Dialog.Header>

		{#if transaction}
			{#key transaction._id}
				<TransactionForm
					type={transaction.type}
					initialData={{
						amount: transaction.amount,
						description: transaction.description,
						date: transaction.date,
						category: transaction.category,
						notes: transaction.notes,
					}}
					{isSubmitting}
					onSubmit={handleSubmit}
				/>
			{/key}
		{/if}
	</Dialog.Content>
</Dialog.Root>
