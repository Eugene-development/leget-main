import type { ComponentMap } from '../../types';
import ContactFormComponent from '../pages/contact/ContactForm.svelte';
import MapComponent from '../pages/contact/Map.svelte';

export default {
	ContactForm: ContactFormComponent,
	Map: MapComponent
} satisfies ComponentMap;
