<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold">لوحة التحكم</h1>
	<p class="text-muted-foreground">مرحباً بك في متتبع الدخل والمصروفات. هنا ستجد ملخصاً لأداء عملك المالي.</p>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>إجمالي الإيرادات</Card.Description>
				<Card.Title class="text-2xl font-bold">0 د.ع</Card.Title>
			</Card.Header>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>إجمالي المصروفات</Card.Description>
				<Card.Title class="text-2xl font-bold">0 د.ع</Card.Title>
			</Card.Header>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>صافي الربح</Card.Description>
				<Card.Title class="text-2xl font-bold">0 د.ع</Card.Title>
			</Card.Header>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>أرباح متاحة للتوزيع</Card.Description>
				<Card.Title class="text-2xl font-bold">0 د.ع</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>
</div>
