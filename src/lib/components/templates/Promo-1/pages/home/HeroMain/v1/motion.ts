import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

/** One entrance for the interior and its glass caption; never owns content visibility. */
export function animateHeroEntrance(root: HTMLElement) {
	const media = gsap.matchMedia();
	media.add(
		'(prefers-reduced-motion: no-preference)',
		() => {
			const bounds = root.getBoundingClientRect();
			if (document.hidden || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
			if (root.contains(document.activeElement)) return;

			const styles = getComputedStyle(root);
			const seconds = (name: string) => {
				const value = styles.getPropertyValue(name).trim();
				return parseFloat(value) / (value.endsWith('ms') ? 1000 : 1) || 0;
			};
			const duration = seconds('--ds-motion-duration');
			const detailDuration = seconds('--ds-motion-duration-ui-slow');
			const lift = parseFloat(styles.getPropertyValue('--ds-motion-lift')) || 0;
			const curve = styles.getPropertyValue('--ds-motion-ease').match(/cubic-bezier\(([^)]+)\)/);
			const ease = curve ? CustomEase.create('', curve[1]) : 'power3.out';
			const compact = window.matchMedia('(max-width: 767px)').matches;
			const distance = lift * (compact ? 0.4 : 0.8);
			const select = gsap.utils.selector(root);
			const timeline = gsap.timeline({ defaults: { ease, clearProps: 'transform,opacity' } });

			// Keep the photo opaque: it is the first meaningful paint, not a loading curtain.
			timeline.from(
				select('.hero-bg-slide-active'),
				{
					scale: compact ? 1.025 : 1.045,
					duration,
					clearProps: 'transform'
				},
				0
			);
			timeline.from(
				select('.hero-shell'),
				{
					y: distance,
					opacity: 0.65,
					duration: seconds('--ds-motion-duration-fast')
				},
				0
			);

			// Animate semantic groups, leaving rich text and button hover transforms intact.
			const groups = [
				'.hero-company',
				'.hero-title',
				'.hero-description',
				'.hero-actions',
				'.hero-brands'
			];
			groups.forEach((selector, index) => {
				const elements = select(selector);
				if (!elements.length) return;
				timeline.from(
					elements,
					{
						y: distance * 0.5,
						opacity: 0,
						duration: detailDuration
					},
					seconds(`--ds-motion-stagger-${index + 1}`)
				);
			});

			// Finish before interaction so a keyboard user never focuses an invisible control.
			const finish = () => {
				timeline.progress(1);
			};
			const onVisibilityChange = () => {
				if (document.hidden) finish();
			};
			root.addEventListener('focusin', finish);
			root.addEventListener('pointerdown', finish, { passive: true });
			document.addEventListener('visibilitychange', onVisibilityChange);
			return () => {
				root.removeEventListener('focusin', finish);
				root.removeEventListener('pointerdown', finish);
				document.removeEventListener('visibilitychange', onVisibilityChange);
			};
		},
		root
	);

	// matchMedia reverts styles and kills timelines on preference changes and unmount.
	return () => media.revert();
}
