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
	let root = $state<HTMLDivElement>();
	let paused = $state(false);
	const enabled = $derived(animationsEnabled(data));
	const profile = $derived(motionProfile(componentType));
	// Only a version switch restarts the entrance; saving copy does not replay it.
	const version = $derived(
		Object.entries(data)
			.filter(([key]) => key.endsWith('Version'))
			.map(([, value]) => value)
			.join(':')
	);
	const customHero = $derived(componentType === 'HeroMain' && (data.heroVersion ?? 'v1') === 'v1');

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

	$effect(() => {
		if (!root) return;
		version;
		if (!enabled || isEditable || customHero) return;
		const node = root;
		const kind = profile;
		let disposed = false;
		let stop: (() => void) | undefined;
		void import('./runtime')
			.then(({ animatePromoBlock }) => {
				if (!disposed) stop = animatePromoBlock(node, kind, (value) => (paused = value));
			})
			.catch((error) => console.warn('Promo-1 motion unavailable', error));
		return () => {
			disposed = true;
			stop?.();
			paused = false;
		};
	});
</script>

<!-- display:contents preserves sticky positioning, grid slots and section heights. -->
<div
	bind:this={root}
	class="p1-motion-scope contents"
	data-promo-motion={componentType}
	data-motion-profile={profile}
	data-motion-muted={!enabled || isEditable ? '' : undefined}
	data-motion-paused={paused ? '' : undefined}
>
	{@render children()}
</div>
