import { getGraphQLUrl } from '$lib/utils/config';

export interface ProjectTag {
	id: string;
	name: string;
	tag_group_id: string;
}

export interface TagGroup {
	id: string;
	name: string;
	slug: string;
	tags: ProjectTag[];
}

async function request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
	const token = localStorage.getItem('auth_token');
	const response = await fetch(getGraphQLUrl(), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			'X-Forwarded-Host': window.location.hostname
		},
		body: JSON.stringify({ query, variables })
	});
	if (!response.ok) throw new Error('Не удалось связаться с сервером. Попробуйте ещё раз.');
	const result = await response.json();
	if (result.errors?.length || !result.data) {
		throw new Error(
			'Не удалось сохранить или загрузить теги. Проверьте данные и попробуйте ещё раз.'
		);
	}
	return result.data;
}

export async function loadTagGroups(): Promise<TagGroup[]> {
	const data = await request<{ tagGroups: TagGroup[] }>(
		`query ProjectTagGroups { tagGroups { id name slug tags { id name tag_group_id } } }`
	);
	return data.tagGroups;
}

export async function createTag(groupId: string, name: string): Promise<ProjectTag> {
	const data = await request<{ createTag: ProjectTag }>(
		`mutation CreateProjectTag($input: CreateTagInput!) {
			createTag(input: $input) { id name tag_group_id }
		}`,
		{ input: { tag_group_id: groupId, name } }
	);
	return data.createTag;
}
