import { getGraphQLUrl } from '$lib/utils/config';

export interface ProjectTag {
	id: string;
	name: string;
	tag_group_id: string;
	href?: string | null;
	managed?: boolean;
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
		const conflict = result.errors?.find(
			(error: { extensions?: { code?: string } }) => error.extensions?.code === 'TAG_NAME_TAKEN'
		);
		if (conflict) throw new Error('Тег с таким названием уже есть в этой группе.');
		throw new Error(
			'Не удалось сохранить или загрузить теги. Проверьте данные и попробуйте ещё раз.'
		);
	}
	return result.data;
}

export async function loadTagGroups(rubric?: string): Promise<TagGroup[]> {
	const data = await request<{ tagGroups: TagGroup[] }>(
		`query ProjectTagGroups($rubric: String) { tagGroups(rubric: $rubric) { id name slug tags { id name tag_group_id href managed } } }`,
		{ rubric }
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

export async function updateTag(id: string, name: string): Promise<ProjectTag> {
	const data = await request<{ updateTag: ProjectTag }>(
		`mutation UpdateProjectTag($input: UpdateTagInput!) { updateTag(input: $input) { id name tag_group_id } }`,
		{ input: { id, name } }
	);
	return data.updateTag;
}

export async function deleteTag(id: string): Promise<void> {
	await request<{ deleteTag: { id: string } }>(
		`mutation DeleteProjectTag($id: ID!) { deleteTag(id: $id) { id } }`,
		{ id }
	);
}
