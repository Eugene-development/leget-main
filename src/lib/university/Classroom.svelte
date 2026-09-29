<script lang="ts">
	import { continueUrl } from './navigation';
	import type { Course, Attempt } from './types';
	let { course, attempts }: { course: Course; attempts: Attempt[] } = $props();
</script>

<a href={continueUrl(course, attempts)}>Продолжить курс «{course.title}»</a>
