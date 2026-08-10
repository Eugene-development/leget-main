import { catalogEntries } from '$lib/ds/registry';
import type { PageLoad } from './$types';

export const load: PageLoad = () => ({ entries: catalogEntries() });
