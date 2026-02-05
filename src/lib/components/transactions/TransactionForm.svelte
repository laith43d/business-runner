<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { timestampToDateString, dateToTimestamp } from '$lib/utils/format.js';

	type TransactionType = 'income' | 'expense';

	type FormData = {
		amount: number;
		description: string;
		date: number;
		category?: string;
		notes?: string;
	};

	type InitialData = {
		amount: number;
		description: string;
		date: number;
		category?: string;
		notes?: string;
	};

	type Props = {
		type: TransactionType;
		initialData?: InitialData;
		isSubmitting?: boolean;
		onSubmit: (data: FormData) => void;
	};

	let { type, initialData, isSubmitting = false, onSubmit }: Props = $props();

	// Form fields — initialized via $effect to handle edit mode
	let amount = $state('');
	let description = $state('');
	let dateValue = $state(timestampToDateString(Date.now()));
	let category = $state('');
	let notes = $state('');

	// Errors
	let amountError = $state('');
	let descriptionError = $state('');
	let dateError = $state('');
	let categoryError = $state('');

	// Load categories for expense type
	const categories = useQuery(
		api.expenseCategories.list,
		() => (type === 'expense' ? {} : 'skip'),
	);

	// Populate form when initialData is provided (create/edit)
	$effect(() => {
		if (initialData) {
			amount = initialData.amount.toString();
			description = initialData.description;
			dateValue = timestampToDateString(initialData.date);
			category = initialData.category ?? '';
			notes = initialData.notes ?? '';
		}
	});

	function validate(): boolean {
		let valid = true;
		amountError = '';
		descriptionError = '';
		dateError = '';
		categoryError = '';

		const parsedAmount = parseFloat(amount);
		if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
			amountError = 'المبلغ يجب أن يكون أكبر من صفر';
			valid = false;
		}

		if (!description.trim()) {
			descriptionError = 'الوصف مطلوب';
			valid = false;
		}

		if (!dateValue) {
			dateError = 'التاريخ مطلوب';
			valid = false;
		}

		if (type === 'expense' && !category) {
			categoryError = 'يجب اختيار تصنيف';
			valid = false;
		}

		return valid;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate()) return;

		const data: FormData = {
			amount: parseFloat(amount),
			description: description.trim(),
			date: dateToTimestamp(dateValue),
			notes: notes.trim() || undefined,
		};

		if (type === 'expense' && category) {
			data.category = category;
		}

		onSubmit(data);
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<!-- Amount -->
	<div class="space-y-2">
		<Label for="amount">المبلغ *</Label>
		<Input
			id="amount"
			type="number"
			step="0.01"
			min="0.01"
			bind:value={amount}
			placeholder="0.00"
			class={amountError ? 'border-destructive' : ''}
		/>
		{#if amountError}
			<p class="text-sm text-destructive">{amountError}</p>
		{/if}
	</div>

	<!-- Description -->
	<div class="space-y-2">
		<Label for="description">الوصف *</Label>
		<Input
			id="description"
			bind:value={description}
			placeholder={type === 'income' ? 'مثال: إيرادات مبيعات' : 'مثال: فاتورة كهرباء'}
			class={descriptionError ? 'border-destructive' : ''}
		/>
		{#if descriptionError}
			<p class="text-sm text-destructive">{descriptionError}</p>
		{/if}
	</div>

	<!-- Date -->
	<div class="space-y-2">
		<Label for="date">التاريخ *</Label>
		<Input
			id="date"
			type="date"
			bind:value={dateValue}
			class={dateError ? 'border-destructive' : ''}
		/>
		{#if dateError}
			<p class="text-sm text-destructive">{dateError}</p>
		{/if}
	</div>

	<!-- Category (expense only) -->
	{#if type === 'expense'}
		<div class="space-y-2">
			<Label>التصنيف *</Label>
			<Select.Root type="single" value={category} onValueChange={(v) => (category = v)}>
				<Select.Trigger class={`w-full ${categoryError ? 'border-destructive' : ''}`}>
					<span data-slot="select-value" class={!category ? 'text-muted-foreground' : ''}>
						{category || 'اختر التصنيف'}
					</span>
				</Select.Trigger>
				<Select.Content>
					{#if categories?.data}
						{#each categories.data as cat (cat._id)}
							<Select.Item value={cat.name}>{cat.name}</Select.Item>
						{/each}
					{:else}
						<div class="px-3 py-2 text-sm text-muted-foreground">جاري التحميل...</div>
					{/if}
				</Select.Content>
			</Select.Root>
			{#if categoryError}
				<p class="text-sm text-destructive">{categoryError}</p>
			{/if}
		</div>
	{/if}

	<!-- Notes -->
	<div class="space-y-2">
		<Label for="notes">ملاحظات</Label>
		<Textarea
			id="notes"
			bind:value={notes}
			placeholder="ملاحظات إضافية (اختياري)"
			rows={3}
		/>
	</div>

	<!-- Submit -->
	<div class="flex justify-end gap-2 pt-2">
		<Button type="submit" disabled={isSubmitting}>
			{#if isSubmitting}
				جاري الحفظ...
			{:else}
				حفظ
			{/if}
		</Button>
	</div>
</form>
