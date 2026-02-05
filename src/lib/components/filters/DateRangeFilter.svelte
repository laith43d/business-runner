<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { timestampToDateString, dateToTimestamp } from '$lib/utils/format.js';

	type Props = {
		dateFrom: number | undefined;
		dateTo: number | undefined;
		onDateChange: (from: number | undefined, to: number | undefined) => void;
	};

	let { dateFrom, dateTo, onDateChange }: Props = $props();

	type Preset = 'all' | 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

	let selectedPreset = $state<Preset>('all');
	let customFrom = $state('');
	let customTo = $state('');

	const presetLabels: Record<Preset, string> = {
		all: 'الكل',
		this_month: 'هذا الشهر',
		last_month: 'الشهر الماضي',
		last_3_months: 'آخر 3 أشهر',
		last_6_months: 'آخر 6 أشهر',
		this_year: 'هذا العام',
		custom: 'نطاق مخصص',
	};

	function getPresetRange(preset: Preset): { from: number | undefined; to: number | undefined } {
		const now = new Date();

		if (preset === 'all') {
			return { from: undefined, to: undefined };
		}

		if (preset === 'custom') {
			return {
				from: customFrom ? dateToTimestamp(customFrom) : undefined,
				to: customTo ? dateToTimestamp(customTo) + 86400000 - 1 : undefined, // end of day
			};
		}

		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const endOfToday = new Date(startOfToday.getTime() + 86400000 - 1);

		switch (preset) {
			case 'this_month': {
				const start = new Date(now.getFullYear(), now.getMonth(), 1);
				return { from: start.getTime(), to: endOfToday.getTime() };
			}
			case 'last_month': {
				const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
				return { from: start.getTime(), to: end.getTime() };
			}
			case 'last_3_months': {
				const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
				return { from: start.getTime(), to: endOfToday.getTime() };
			}
			case 'last_6_months': {
				const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
				return { from: start.getTime(), to: endOfToday.getTime() };
			}
			case 'this_year': {
				const start = new Date(now.getFullYear(), 0, 1);
				return { from: start.getTime(), to: endOfToday.getTime() };
			}
			default:
				return { from: undefined, to: undefined };
		}
	}

	function handlePresetChange(preset: string) {
		selectedPreset = preset as Preset;
		if (preset !== 'custom') {
			const range = getPresetRange(preset as Preset);
			onDateChange(range.from, range.to);
		}
	}

	function handleCustomFromChange(e: Event) {
		customFrom = (e.target as HTMLInputElement).value;
		if (selectedPreset === 'custom') {
			const range = getPresetRange('custom');
			onDateChange(range.from, range.to);
		}
	}

	function handleCustomToChange(e: Event) {
		customTo = (e.target as HTMLInputElement).value;
		if (selectedPreset === 'custom') {
			const range = getPresetRange('custom');
			onDateChange(range.from, range.to);
		}
	}
</script>

<div class="flex flex-wrap items-end gap-3">
	<div class="space-y-1.5">
		<Label class="text-xs text-muted-foreground">الفترة</Label>
		<Select.Root type="single" value={selectedPreset} onValueChange={handlePresetChange}>
			<Select.Trigger class="w-[180px]">
				<span data-slot="select-value">
					{presetLabels[selectedPreset]}
				</span>
			</Select.Trigger>
			<Select.Content>
				{#each Object.entries(presetLabels) as [value, label]}
					<Select.Item {value}>{label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	{#if selectedPreset === 'custom'}
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">من</Label>
			<Input type="date" value={customFrom} oninput={handleCustomFromChange} class="w-[160px]" />
		</div>
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">إلى</Label>
			<Input type="date" value={customTo} oninput={handleCustomToChange} class="w-[160px]" />
		</div>
	{/if}
</div>
