import { cityStore } from './city.svelte';

class UIStore {
	menuOpen = $state(false);

	toggleMenu() {
		this.menuOpen = !this.menuOpen;
	}

	closeMenu() {
		this.menuOpen = false;
	}
}

export const uiStore = new UIStore();
