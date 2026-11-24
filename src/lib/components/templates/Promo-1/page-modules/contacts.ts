import type { ComponentMap } from '../../types';
import ContactsHero from '../pages/contacts/Hero/index.svelte';
import ContactChannels from '../pages/contacts/ContactChannels.svelte';
import ContactAddress from '../pages/contacts/ContactAddress/index.svelte';
import ContactMessengers from '../pages/contacts/ContactMessengers.svelte';
import ContactCTA from '../pages/contacts/ContactCTA/index.svelte';

export default {
	ContactsHero: ContactsHero,
	ContactChannels,
	ContactAddress,
	ContactMessengers,
	ContactCTA
} satisfies ComponentMap;
