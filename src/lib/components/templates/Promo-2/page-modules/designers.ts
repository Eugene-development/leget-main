import type { ComponentMap } from '../../types';
import DesignersHero from '../pages/designers/Hero.svelte';
import DesignersBenefits from '../pages/designers/DesignersBenefits.svelte';
import DesignersTracks from '../pages/designers/DesignersTracks.svelte';
import DesignersSteps from '../pages/designers/DesignersSteps.svelte';
import DesignersForm from '../pages/designers/DesignersForm.svelte';

export default {
	Hero: DesignersHero,
	DesignersBenefits: DesignersBenefits,
	DesignersTracks: DesignersTracks,
	DesignersSteps: DesignersSteps,
	DesignersForm: DesignersForm
} satisfies ComponentMap;
