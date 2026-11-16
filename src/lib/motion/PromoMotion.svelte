<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import {
		animationsEnabled,
		motionProfile,
		PROMO_MOTION_CONTEXT,
		type PromoMotionContext
	} from './promo';
	import './promo.css';

	let {
		data,
		componentType,
		isEditable = false,
		children
	}: {
		data: Record<string, unknown>;
		componentType: string;
		isEditable?: boolean;
		children: Snippet;
	} = $props();
	const enabled = $derived(animationsEnabled(data));
	const profile = $derived(motionProfile(componentType));

	setContext<PromoMotionContext>(PROMO_MOTION_CONTEXT, {
		get supported() {
			return true;
		},
		get enabled() {
			return enabled;
		},
		get editable() {
			return isEditable;
		}
	});
</script>

<!-- display:contents preserves sticky positioning, grid slots and section heights. -->
<div
	class="p1-motion-scope contents"
	data-promo-motion={componentType}
	data-motion-profile={profile}
	data-motion-muted={!enabled || isEditable ? '' : undefined}
>
	{@render children()}
</div>
