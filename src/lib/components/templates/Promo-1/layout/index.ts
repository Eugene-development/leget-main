/**
 * Layout-модуль Promo-1: Banner, Header, Footer без реестра страниц.
 *
 * Нужен, чтобы маршрут конкретной страницы (например /guarantees) мог подключить
 * только шапку с подвалом и свои блоки, а не ../index.ts со ВСЕМИ страницами
 * шаблона. Именно на этом держится код-сплит по маршрутам.
 */
export { default as Banner } from './Banner/index.svelte';
export { default as Header } from './Header.svelte';
export { default as Footer } from './Footer/index.svelte';
