import buttonGoals from './button-goals.json';

export function templateGoalName(template: string, id: string): string {
	return `${template.toLowerCase().replaceAll('-', '_')}_${id}`;
}

/** Один обработчик на документ: работает и для порталов SideDrawer. */
export function installGoalTracking(
	doc: Document,
	getConfig: () => { counterId: string | null; template: string; enabled: boolean },
	send: (counterId: number, method: string, goal: string) => void
) {
	function click(event: MouseEvent) {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const button = target.closest<HTMLElement>('[data-metrika-goal]');
		if (!button || button.matches(':disabled') || button.closest('[inert]')) return;
		const id = button.dataset.metrikaGoal;
		const config = getConfig();
		if (!id || !config.enabled || !config.counterId) return;
		if (!buttonGoals.some((goal) => goal.id === id && goal.templates.includes(config.template)))
			return;
		try {
			send(Number(config.counterId), 'reachGoal', templateGoalName(config.template, id));
		} catch {
			// Аналитика не должна прерывать открытие, отправку или закрытие формы.
		}
	}
	doc.addEventListener('click', click, true);
	return () => doc.removeEventListener('click', click, true);
}
