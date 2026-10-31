<script lang="ts">
import PageRenderer from '$lib/components/PageRenderer.svelte';
import Header from '$lib/components/templates/Promo-1/layout/Header.svelte';
import Banner from '$lib/components/templates/Promo-1/layout/Banner/index.svelte';
import PromoStrip from '$lib/components/templates/Promo-1/layout/PromoStrip/index.svelte';
</script>
<PageRenderer layout={{Header, Banner, PromoStrip}} componentMap={{}} components={[]} headerData={{}} footerData={null} seo={null} editContext={null}/>
<main style="min-height:400vh;padding:40px">Проверка шапки 1.М.1 при смене направления прокрутки</main>
