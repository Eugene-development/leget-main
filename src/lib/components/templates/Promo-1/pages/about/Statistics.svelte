<!-- Статистика -->
<script lang="ts">
	let { data = {} }: { data: Record<string, unknown> } = $props();
</script>

<div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<div class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
			<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-linear-to-br from-sky-100 to-cyan-100 opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
			<div class="relative">
				<div class="text-5xl font-bold text-slate-900">300+</div>
				<div class="mt-2 text-slate-600">Партнёрских салонов</div>
				<div class="mt-4 h-1 w-12 rounded-full bg-linear-to-r from-sky-500 to-cyan-500"></div>
			</div>
		</div>
		<div class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
			<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-linear-to-br from-emerald-100 to-teal-100 opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
			<div class="relative">
				<div class="text-5xl font-bold text-slate-900">20+</div>
				<div class="mt-2 text-slate-600">Лет опыта</div>
				<div class="mt-4 h-1 w-12 rounded-full bg-linear-to-r from-emerald-500 to-teal-500"></div>
			</div>
		</div>
		<div class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
			<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-linear-to-br from-violet-100 to-purple-100 opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
			<div class="relative">
				<div class="text-5xl font-bold text-slate-900">17</div>
				<div class="mt-2 text-slate-600">Городов России</div>
				<div class="mt-4 h-1 w-12 rounded-full bg-linear-to-r from-violet-500 to-purple-500"></div>
			</div>
		</div>
		<div class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
			<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-linear-to-br from-amber-100 to-orange-100 opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
			<div class="relative">
				<div class="text-5xl font-bold text-slate-900">4000+</div>
				<div class="mt-2 text-slate-600">Реализованных проектов</div>
				<div class="mt-4 h-1 w-12 rounded-full bg-linear-to-r from-amber-500 to-orange-500"></div>
			</div>
		</div>
	</div>
</div>
