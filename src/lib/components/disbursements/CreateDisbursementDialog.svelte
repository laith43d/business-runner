<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { toast } from 'svelte-sonner';
	import { formatCurrency } from '$lib/utils/format.js';
	import { timestampToDateString } from '$lib/utils/format.js';
	import { AlertTriangle } from 'lucide-svelte';

	type Props = {
		open: boolean;
		shareholderId: Id<'shareholders'> | null;
		shareholderName: string;
		maxAmount: number;
		periodLabel: string;
		onClose: () => void;
	};

	let { open = $bindable(), shareholderId, shareholderName, maxAmount, periodLabel, onClose }: Props =
		$props();

	let amount = $state<number | ''>('');
	let date = $state(timestampToDateString(Date.now()));
	let notes = $state('');
	let isSubmitting = $state(false);

	let amountError = $state('');
	let dateError = $state('');

	// Derived: is the entered amount creating debt?
	let createsDebt = $derived.by(() => {
		const amt = Number(amount);
		return amount !== '' && !isNaN(amt) && amt > 0 && amt > maxAmount;
	});

	const client = useConvexClient();

	// Reset form when dialog opens/closes
	$effect(() => {
		if (open) {
			amount = '';
			date = timestampToDateString(Date.now());
			notes = '';
			amountError = '';
			dateError = '';
		}
	});

	function validate(): boolean {
		amountError = '';
		dateError = '';
		let valid = true;

		const amt = Number(amount);
		if (amount === '' || isNaN(amt)) {
			amountError = 'المبلغ مطلوب';
			valid = false;
		} else if (amt <= 0) {
			amountError = 'المبلغ يجب أن يكون أكبر من صفر';
			valid = false;
		}

		if (!date) {
			dateError = 'التاريخ مطلوب';
			valid = false;
		}

		return valid;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate() || !shareholderId) return;

		isSubmitting = true;
		try {
			// Convert date string to timestamp
			const [year, month, day] = date.split('-').map(Number);
			const dateTimestamp = new Date(year, month - 1, day).getTime();

			await client.mutation(api.disbursements.create, {
				shareholderId,
				amount: Number(amount),
				date: dateTimestamp,
				period: periodLabel,
				notes: notes.trim() || undefined,
			});
			toast.success(`تم توزيع ${formatCurrency(Number(amount))} للشريك ${shareholderName}`);
			onClose();
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء تسجيل التوزيع';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => { if (!v) onClose(); }}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>تسجيل توزيع أرباح</Dialog.Title>
			<Dialog.Description>
				تسجيل توزيع أرباح للشريك <strong>{shareholderName}</strong>
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Shareholder (read-only) -->
			<div class="space-y-2">
				<Label>الشريك</Label>
				<Input value={shareholderName} disabled class="bg-muted" />
			</div>

			<!-- Period (read-only) -->
			<div class="space-y-2">
				<Label>الفترة</Label>
				<Input value={periodLabel} disabled class="bg-muted" />
			</div>

			<!-- Amount -->
			<div class="space-y-2">
				<Label for="disb-amount">المبلغ *</Label>
				<Input
					id="disb-amount"
					type="number"
					dir="ltr"
					min="0.01"
					step="0.01"
					bind:value={amount}
					placeholder="0.00"
					class={amountError ? 'border-destructive' : createsDebt ? 'border-yellow-500' : ''}
				/>
				{#if maxAmount > 0}
					<p class="text-sm text-muted-foreground">
						المتبقي من الحصة: {formatCurrency(maxAmount)}
					</p>
				{:else if maxAmount === 0}
					<p class="text-sm text-muted-foreground">
						تم توزيع كامل الحصة — أي مبلغ سينشئ ديناً
					</p>
				{:else}
					<p class="text-sm text-red-600">
						الشريك مدين بمبلغ {formatCurrency(Math.abs(maxAmount))} — أي مبلغ سيزيد الدين
					</p>
				{/if}
				{#if createsDebt}
					<div class="flex items-center gap-2 rounded-md border border-yellow-500/50 bg-yellow-50 p-2 dark:bg-yellow-950/20">
						<AlertTriangle class="h-4 w-4 shrink-0 text-yellow-600" />
						<p class="text-sm text-yellow-700 dark:text-yellow-400">
							تحذير: المبلغ يتجاوز الحصة المستحقة بـ {formatCurrency(Number(amount) - Math.max(0, maxAmount))}. سيتم تسجيل دين على الشريك.
						</p>
					</div>
				{/if}
				{#if amountError}
					<p class="text-sm text-destructive">{amountError}</p>
				{/if}
			</div>

			<!-- Date -->
			<div class="space-y-2">
				<Label for="disb-date">التاريخ *</Label>
				<Input
					id="disb-date"
					type="date"
					bind:value={date}
					class={dateError ? 'border-destructive' : ''}
				/>
				{#if dateError}
					<p class="text-sm text-destructive">{dateError}</p>
				{/if}
			</div>

			<!-- Notes -->
			<div class="space-y-2">
				<Label for="disb-notes">ملاحظات</Label>
				<Textarea
					id="disb-notes"
					bind:value={notes}
					placeholder="ملاحظات اختيارية"
					rows={2}
				/>
			</div>

			<Dialog.Footer>
				<Dialog.Close>
					{#snippet child({ props })}
						<Button {...props} variant="outline" type="button">إلغاء</Button>
					{/snippet}
				</Dialog.Close>
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						جاري الحفظ...
					{:else}
						تسجيل التوزيع
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
