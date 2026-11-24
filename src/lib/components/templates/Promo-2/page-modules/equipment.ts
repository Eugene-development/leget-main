import type { ComponentMap } from '../../types';
import EquipmentHero from '../pages/equipment/EquipmentHero/index.svelte';
import EquipmentAppliances from '../pages/equipment/EquipmentAppliances/index.svelte';
import EquipmentWorktops from '../pages/equipment/EquipmentWorktops/index.svelte';
import EquipmentPlumbing from '../pages/equipment/EquipmentPlumbing/index.svelte';
import EquipmentLighting from '../pages/equipment/EquipmentLighting/index.svelte';
import EquipmentStorage from '../pages/equipment/EquipmentStorage/index.svelte';
import EquipmentCTA from '../pages/equipment/EquipmentCTA/index.svelte';

export default {
	EquipmentHero,
	EquipmentAppliances,
	EquipmentWorktops,
	EquipmentPlumbing,
	EquipmentLighting,
	EquipmentStorage,
	EquipmentCTA
} satisfies ComponentMap;
