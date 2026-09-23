import type { ServiceType } from '$lib/stores/serviceOrder.svelte';
import { createFormSender } from '$lib/utils/form-submission';
import { cleanPhone } from '$lib/utils/phone';

export type ServiceRequestInput = {
	serviceType: ServiceType;
	formId?: string;
	formTitle?: string;
	name: string;
	phone: string;
	message?: string | null;
	objectAddress?: string;
	visitTime?: string;
	dimensions?: string[];
	city: string;
	sourceUrl?: string | null;
	attachments?: {
		passportMain: File;
		passportRegistration: File;
		clientPhoto: File;
	};
};

type ServiceRequestResult = {
	id: string | number;
	status: string;
};

const senders = new Map<string, ReturnType<typeof createFormSender>>();

export async function submitServiceRequest(
	input: ServiceRequestInput
): Promise<ServiceRequestResult> {
	const formId = input.formId ?? 'service-order';
	if (!senders.has(formId)) senders.set(formId, createFormSender(formId));
	const payload = new FormData();
	payload.set('service_type', input.serviceType);
	if (input.formTitle) payload.set('form_title', input.formTitle);
	payload.set('name', input.name.trim());
	payload.set('phone', cleanPhone(input.phone));
	payload.set('city', input.city);
	if (input.message) payload.set('message', input.message.trim());
	if (input.objectAddress) payload.set('object_address', input.objectAddress.trim());
	if (input.visitTime) payload.set('visit_time', input.visitTime.trim());
	for (const dimension of input.dimensions ?? []) payload.append('dimensions[]', dimension.trim());
	if (input.sourceUrl) payload.set('source_url', input.sourceUrl.slice(0, 500));
	if (input.attachments) {
		payload.set('passport_main', input.attachments.passportMain);
		payload.set('passport_registration', input.attachments.passportRegistration);
		payload.set('client_photo', input.attachments.clientPhoto);
	}
	return senders.get(formId)!(payload);
}
