import { GraphQLClient } from 'graphql-request';
import { LEGET_API_URL } from '$env/static/private';

/**
 * Creates a GraphQLClient instance configured with the leget-api
 * /graphql endpoint URL and optional custom headers.
 *
 * @param headers - Optional headers to include in requests (e.g., X-Forwarded-Host)
 * @returns A configured GraphQLClient instance
 */
export function createGraphQLClient(headers?: Record<string, string>): GraphQLClient {
	return new GraphQLClient(`${LEGET_API_URL}/graphql`, {
		headers: headers ?? {}
	});
}
