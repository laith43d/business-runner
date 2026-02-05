<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Tooltip,
		Legend,
		Filler,
	} from 'chart.js';
	import ChartContainer from '$lib/components/charts/ChartContainer.svelte';

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

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

	function computeMargins() {
		return data.map((d) => {
			if (d.income === 0) return 0;
			return Math.round((d.profit / d.income) * 100 * 10) / 10;
		});
	}

	function createChart() {
		if (!canvas || data.length === 0) return;

		if (chart) {
			chart.destroy();
		}

		const margins = computeMargins();

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: data.map((d) => d.month),
				datasets: [
					{
						label: 'هامش الربح %',
						data: margins,
						borderColor: 'rgb(99, 102, 241)',
						backgroundColor: 'rgba(99, 102, 241, 0.1)',
						fill: true,
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6,
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
								return `هامش الربح: ${context.parsed.y}%`;
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
						grid: { color: 'rgba(0, 0, 0, 0.06)' },
						ticks: {
							font: { size: 11 },
							callback(value) {
								return `${value}%`;
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

<ChartContainer title="هامش الربح %" {loading} empty={data.length === 0}>
	<div class="h-64">
		<canvas bind:this={canvas}></canvas>
	</div>
</ChartContainer>
