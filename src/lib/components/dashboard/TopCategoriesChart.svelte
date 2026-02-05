<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart,
		BarController,
		BarElement,
		LinearScale,
		CategoryScale,
		Tooltip,
		Legend,
	} from 'chart.js';
	import ChartContainer from '$lib/components/charts/ChartContainer.svelte';
	import { formatCurrency } from '$lib/utils/format.js';

	Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

	type CategoryData = {
		category: string;
		total: number;
		percentage: number;
	};

	type Props = {
		data: CategoryData[];
		loading?: boolean;
	};

	let { data, loading = false }: Props = $props();

	const COLORS = [
		'rgba(59, 130, 246, 0.7)',   // blue
		'rgba(239, 68, 68, 0.7)',    // red
		'rgba(34, 197, 94, 0.7)',    // green
		'rgba(249, 115, 22, 0.7)',   // orange
		'rgba(168, 85, 247, 0.7)',   // purple
	];

	const BORDER_COLORS = [
		'rgb(59, 130, 246)',
		'rgb(239, 68, 68)',
		'rgb(34, 197, 94)',
		'rgb(249, 115, 22)',
		'rgb(168, 85, 247)',
	];

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	function createChart() {
		if (!canvas || data.length === 0) return;

		if (chart) {
			chart.destroy();
		}

		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: data.map((d) => d.category),
				datasets: [
					{
						label: 'الإنفاق',
						data: data.map((d) => d.total),
						backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
						borderColor: data.map((_, i) => BORDER_COLORS[i % BORDER_COLORS.length]),
						borderWidth: 1,
						borderRadius: 4,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						rtl: true,
						textDirection: 'rtl',
						callbacks: {
							label(context) {
								const idx = context.dataIndex;
								const item = data[idx];
								return `${formatCurrency(item.total)} (${item.percentage}%)`;
							},
						},
					},
				},
				scales: {
					x: {
						beginAtZero: true,
						grid: { color: 'rgba(0, 0, 0, 0.06)' },
						ticks: {
							font: { size: 11 },
							callback(value) {
								return formatCurrency(value as number);
							},
						},
					},
					y: {
						grid: { display: false },
						ticks: {
							font: { size: 12 },
						},
					},
				},
			},
		});
	}

	onMount(() => {
		if (!loading && data.length > 0) {
			createChart();
		}
	});

	$effect(() => {
		if (data && !loading && canvas) {
			createChart();
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});
</script>

<ChartContainer title="أعلى ٥ تصنيفات إنفاقاً" {loading} empty={data.length === 0}>
	<div class="h-64">
		<canvas bind:this={canvas}></canvas>
	</div>
</ChartContainer>
