<script lang="ts">
	import { resolveComponent } from '$lib/ds/registry';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// load уже проверил, что компонент существует, — иначе была бы 404.
	const Block = $derived(resolveComponent(data.templateId, data.pageSlug, data.type)!);
</script>

<svelte:head>
	<title>{data.templateId}{data.pageSlug}:{data.type} v{data.version}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<!--
	Блок монтируется голым: без layout сайта, без редакторской обвязки.
	Переключатель версий, бейдж артикула и панель настроек внутри компонентов
	условны по isEditable && editContext — передаём false/null и получаем чистую
	разметку, вырезать ничего не нужно.

	data передаём без bind: свойство объявлено $bindable, но писать в него компонент
	будет только при редактировании, которого здесь нет. Своя копия в $state тут лишь
	мешала бы — при переходе между карточками она бы залипала на первом значении.
-->
<Block data={data.data} editContext={null} isEditable={false} />
