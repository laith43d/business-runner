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

	type MonthlyData = {
		month: string;
		monthKey: string;
		income: number;
		expenses: number;
		profit: number;
	};

	type Props = {
		data: MonthlyData[];
		loading?: boolean;
	};

	let { data, loading = false }: Props = $props();

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
				labels: data.map((d) => d.month),
				datasets: [
					{
						label: 'الإيرادات الشهرية',
						data: data.map((d) => d.income),
						backgroundColor: 'rgba(34, 197, 94, 0.7)',
						borderColor: 'rgb(34, 197, 94)',
						borderWidth: 1,
						borderRadius: 4,
						hoverBackgroundColor: 'rgba(34, 197, 94, 0.9)',
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						rtl: true,
						textDirection: 'rtl',
						callbacks: {
							label(context) {
								return `الإيرادات: ${formatCurrency(context.parsed.y ?? 0)}`;
							},
						},
					},
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							font: { size: 11 },
							maxRotation: 45,
						},
					},
					y: {
						beginAtZero: true,
						grid: { color: 'rgba(0, 0, 0, 0.06)' },
						ticks: {
							font: { size: 11 },
							callback(value) {
								return formatCurrency(value as number);
							},
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

<ChartContainer title="الإيرادات الشهرية" {loading} empty={data.length === 0}>
	<div class="h-64">
		<canvas bind:this={canvas}></canvas>
	</div>
</ChartContainer>
