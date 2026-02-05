<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { toast } from 'svelte-sonner';
	import { Plus } from 'lucide-svelte';

	let open = $state(false);
	let name = $state('');
	let description = $state('');
	let isSubmitting = $state(false);
	let nameError = $state('');

	const client = useConvexClient();

	function resetForm() {
		name = '';
		description = '';
		nameError = '';
		isSubmitting = false;
	}

	function validate(): boolean {
		nameError = '';
		if (!name.trim()) {
			nameError = 'اسم الفئة مطلوب';
			return false;
		}
		return true;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate()) return;

		isSubmitting = true;
		try {
			await client.mutation(api.expenseCategories.create, {
				name: name.trim(),
				description: description.trim() || undefined,
			});
			toast.success('تم إضافة الفئة بنجاح');
			open = false;
			resetForm();
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء إضافة الفئة';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => { if (!v) resetForm(); }}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props}>
				<Plus class="h-4 w-4" />
				إضافة فئة
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>إضافة فئة جديدة</Dialog.Title>
			<Dialog.Description>أدخل بيانات فئة المصروفات الجديدة</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">الاسم *</Label>
				<Input
					id="name"
					bind:value={name}
					placeholder="مثال: إيجار"
					class={nameError ? 'border-destructive' : ''}
				/>
				{#if nameError}
					<p class="text-sm text-destructive">{nameError}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">الوصف</Label>
				<Textarea
					id="description"
					bind:value={description}
					placeholder="وصف اختياري للفئة"
					rows={3}
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
						حفظ
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
