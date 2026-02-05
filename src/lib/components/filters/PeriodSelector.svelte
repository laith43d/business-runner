<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { dateToTimestamp } from '$lib/utils/format.js';

	type Props = {
		dateFrom: number;
		dateTo: number;
		periodLabel: string;
		onPeriodChange: (from: number, to: number, label: string) => void;
	};

	let { dateFrom, dateTo, periodLabel, onPeriodChange }: Props = $props();

	type Preset =
		| 'this_month'
		| 'this_quarter'
		| 'this_year'
		| 'q1'
		| 'q2'
		| 'q3'
		| 'q4'
		| 'custom';

	let selectedPreset = $state<Preset>('this_month');
	let customFrom = $state('');
	let customTo = $state('');

	const presetLabels: Record<Preset, string> = {
		this_month: 'هذا الشهر',
		this_quarter: 'هذا الربع',
		this_year: 'هذا العام',
		q1: 'الربع الأول (يناير - مارس)',
		q2: 'الربع الثاني (أبريل - يونيو)',
		q3: 'الربع الثالث (يوليو - سبتمبر)',
		q4: 'الربع الرابع (أكتوبر - ديسمبر)',
		custom: 'نطاق مخصص',
	};

	function getQuarterNumber(month: number): number {
		return Math.floor(month / 3) + 1;
	}

	function getPresetRange(preset: Preset): { from: number; to: number; label: string } {
		const now = new Date();
		const year = now.getFullYear();
		const endOfToday = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);

		switch (preset) {
			case 'this_month': {
				const start = new Date(year, now.getMonth(), 1);
				return {
					from: start.getTime(),
					to: endOfToday.getTime(),
					label: `${year}-M${now.getMonth() + 1}`,
				};
			}
			case 'this_quarter': {
				const q = getQuarterNumber(now.getMonth());
				const startMonth = (q - 1) * 3;
				const start = new Date(year, startMonth, 1);
				return {
					from: start.getTime(),
					to: endOfToday.getTime(),
					label: `${year}-Q${q}`,
				};
			}
			case 'this_year': {
				const start = new Date(year, 0, 1);
				return {
					from: start.getTime(),
					to: endOfToday.getTime(),
					label: `${year}`,
				};
			}
			case 'q1': {
				const start = new Date(year, 0, 1);
				const end = new Date(year, 2, 31, 23, 59, 59, 999);
				return { from: start.getTime(), to: end.getTime(), label: `${year}-Q1` };
			}
			case 'q2': {
				const start = new Date(year, 3, 1);
				const end = new Date(year, 5, 30, 23, 59, 59, 999);
				return { from: start.getTime(), to: end.getTime(), label: `${year}-Q2` };
			}
			case 'q3': {
				const start = new Date(year, 6, 1);
				const end = new Date(year, 8, 30, 23, 59, 59, 999);
				return { from: start.getTime(), to: end.getTime(), label: `${year}-Q3` };
			}
			case 'q4': {
				const start = new Date(year, 9, 1);
				const end = new Date(year, 11, 31, 23, 59, 59, 999);
				return { from: start.getTime(), to: end.getTime(), label: `${year}-Q4` };
			}
			case 'custom': {
				const from = customFrom ? dateToTimestamp(customFrom) : new Date(year, 0, 1).getTime();
				const to = customTo
					? dateToTimestamp(customTo) + 86400000 - 1
					: endOfToday.getTime();
				return { from, to, label: 'custom' };
			}
			default: {
				const start = new Date(year, now.getMonth(), 1);
				return { from: start.getTime(), to: endOfToday.getTime(), label: `${year}-M${now.getMonth() + 1}` };
			}
		}
	}

	function handlePresetChange(preset: string) {
		selectedPreset = preset as Preset;
		if (preset !== 'custom') {
			const range = getPresetRange(preset as Preset);
			onPeriodChange(range.from, range.to, range.label);
		}
	}

	function handleCustomFromChange(e: Event) {
		customFrom = (e.target as HTMLInputElement).value;
		if (selectedPreset === 'custom') {
			const range = getPresetRange('custom');
			onPeriodChange(range.from, range.to, range.label);
		}
	}

	function handleCustomToChange(e: Event) {
		customTo = (e.target as HTMLInputElement).value;
		if (selectedPreset === 'custom') {
			const range = getPresetRange('custom');
			onPeriodChange(range.from, range.to, range.label);
		}
	}
</script>

<div class="flex flex-wrap items-end gap-3">
	<div class="space-y-1.5">
		<Label class="text-xs text-muted-foreground">الفترة</Label>
		<Select.Root type="single" value={selectedPreset} onValueChange={handlePresetChange}>
			<Select.Trigger class="w-[260px]">
				<span data-slot="select-value">
					{presetLabels[selectedPreset]}
				</span>
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="this_month">{presetLabels.this_month}</Select.Item>
				<Select.Item value="this_quarter">{presetLabels.this_quarter}</Select.Item>
				<Select.Item value="this_year">{presetLabels.this_year}</Select.Item>
				<Select.Separator />
				<Select.Item value="q1">{presetLabels.q1}</Select.Item>
				<Select.Item value="q2">{presetLabels.q2}</Select.Item>
				<Select.Item value="q3">{presetLabels.q3}</Select.Item>
				<Select.Item value="q4">{presetLabels.q4}</Select.Item>
				<Select.Separator />
				<Select.Item value="custom">{presetLabels.custom}</Select.Item>
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
