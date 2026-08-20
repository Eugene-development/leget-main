import type { ServiceType } from '$lib/stores/serviceOrder.svelte';
import { getAuthApiUrl, getGraphQLUrl } from '$lib/utils/config';
import { cleanPhone } from '$lib/utils/phone';

export type ServiceRequestInput = {
	serviceType: ServiceType;
	name: string;
	phone: string;
	message?: string | null;
	city: string;
	sourceUrl?: string | null;
};

type ServiceRequestResult = {
	id: string | number;
	status: string;
};

const SUBMIT_ERROR = 'Не удалось отправить заявку. Попробуйте ещё раз.';

export async function submitServiceRequest(
	input: ServiceRequestInput
): Promise<ServiceRequestResult> {
	const payload = {
		service_type: input.serviceType,
		name: input.name.trim(),
		phone: cleanPhone(input.phone),
		message: input.message?.trim() || null,
		source_url: input.sourceUrl ?? null,
		city: input.city
	};

	const graphqlResponse = await fetch(getGraphQLUrl(), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `
				mutation CreateServiceRequest($input: CreateServiceRequestInput!) {
					createServiceRequest(input: $input) {
						id
						status
					}
				}
			`,
			variables: { input: payload }
		})
	});

	const graphqlResult = await graphqlResponse.json().catch(() => null);
	const request = graphqlResult?.data?.createServiceRequest as ServiceRequestResult | undefined;

	if (!graphqlResponse.ok || graphqlResult?.errors || !request) {
		throw new Error(SUBMIT_ERROR);
	}

	const authResponse = await fetch(`${getAuthApiUrl()}/notify/service-request`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	if (!authResponse.ok) {
		throw new Error(SUBMIT_ERROR);
	}

	return request;
}
