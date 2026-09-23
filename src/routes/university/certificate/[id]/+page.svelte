<script lang="ts">
	import Frame from '$lib/university/Frame.svelte';
	import UniversityMark from '$lib/components/templates/Promo-1/pages/university/UniversityMark.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head
	><title>Сертификат — {data.certificate.course_title}</title><meta
		name="robots"
		content="noindex"
	/></svelte:head
>
<Frame>
	<div class="academy-certificate-actions">
		<a class="academy-link" href="/university/student">Мои сертификаты</a><button
			class="academy-button"
			onclick={() => window.print()}
			data-goal-ignore="Печать или сохранение полученного сертификата в PDF"
			>Распечатать / сохранить PDF</button
		>
	</div>
	<article class="academy-certificate ym-hide-content">
		<UniversityMark class="academy-seal" />
		<p>Универ · Университет о доме</p>
		<h1>Сертификат</h1>
		<p class="academy-lead">о прохождении курса</p>
		<h2>{data.certificate.student_name}</h2>
		<p>изучил(а) материалы и успешно сдал(а) итоговый экзамен по курсу</p>
		<h3>«{data.certificate.course_title}»</h3>
		<p>Дисциплина «{data.certificate.discipline}»</p>
		<div class="academy-certificate-meta">
			<p>Результат экзамена<strong>{data.certificate.score}%</strong></p>
			<p>Дата выдачи<strong>{data.certificate.issued_at.slice(0, 10)}</strong></p>
		</div>
		<p class="academy-fine">Номер записи: {data.certificate.id}</p>
		<p class="academy-fine">
			Подтверждает прохождение внутреннего учебного курса. Не является документом об образовании или
			присвоении квалификации.
		</p>
	</article>
</Frame>
