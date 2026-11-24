import type { ComponentMap } from '../../types';
import ContactsHero from '../pages/contacts/Hero.svelte';
import ContactsSalons from '../pages/contacts/Salons.svelte';
import ContactsCourier from '../pages/contacts/Courier.svelte';
import ContactsForm from '../pages/contacts/Form.svelte';

export default {
	Hero: ContactsHero,
	Salons: ContactsSalons,
	Courier: ContactsCourier,
	Form: ContactsForm
} satisfies ComponentMap;
