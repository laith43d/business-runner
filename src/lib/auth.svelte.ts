import { getContext, setContext } from "svelte";
import { useConvexClient } from "convex-svelte";
import { ConvexHttpClient } from "convex/browser";
import { browser } from "$app/environment";

const JWT_STORAGE_KEY = "__convexAuthJWT";
const REFRESH_TOKEN_STORAGE_KEY = "__convexAuthRefreshToken";
const AUTH_URL_CONTEXT_KEY = "$$_convexAuthUrl";

function getStorageKey(key: string, namespace: string): string {
	const escapedNamespace = namespace.replace(/[^a-zA-Z0-9]/g, "");
	return `${key}_${escapedNamespace}`;
}

function setAuthFetcher(client: ReturnType<typeof useConvexClient>, url: string) {
	client.setAuth(
		async ({ forceRefreshToken }) => {
			if (forceRefreshToken) {
				const refreshToken = localStorage.getItem(
					getStorageKey(REFRESH_TOKEN_STORAGE_KEY, url),
				);
				if (refreshToken) {
					try {
						const httpClient = new ConvexHttpClient(url);
						const result = (await httpClient.action(
							"auth:signIn" as any,
							{ refreshToken },
						)) as {
							tokens?: { token: string; refreshToken: string } | null;
						};
						if (result.tokens) {
							localStorage.setItem(
								getStorageKey(JWT_STORAGE_KEY, url),
								result.tokens.token,
							);
							localStorage.setItem(
								getStorageKey(REFRESH_TOKEN_STORAGE_KEY, url),
								result.tokens.refreshToken,
							);
							return result.tokens.token;
						}
					} catch {
						localStorage.removeItem(getStorageKey(JWT_STORAGE_KEY, url));
						localStorage.removeItem(
							getStorageKey(REFRESH_TOKEN_STORAGE_KEY, url),
						);
						return null;
					}
				}
				return null;
			}
			return localStorage.getItem(getStorageKey(JWT_STORAGE_KEY, url));
		},
		(_isAuth) => {},
	);
}

export function useAuthActions() {
	const client = useConvexClient();
	const url = getContext<string>(AUTH_URL_CONTEXT_KEY);

	async function signIn(
		provider: string,
		params: Record<string, string>,
	): Promise<{ signingIn: boolean }> {
		const result = (await client.action("auth:signIn" as any, {
			provider,
			params,
		})) as {
			tokens?: { token: string; refreshToken: string } | null;
			redirect?: string;
		};

		if (result.tokens) {
			const { token, refreshToken } = result.tokens;
			localStorage.setItem(getStorageKey(JWT_STORAGE_KEY, url), token);
			localStorage.setItem(
				getStorageKey(REFRESH_TOKEN_STORAGE_KEY, url),
				refreshToken,
			);
			setAuthFetcher(client, url);
			return { signingIn: true };
		}

		return { signingIn: false };
	}

	async function signOut(): Promise<void> {
		try {
			await client.action("auth:signOut" as any, {});
		} catch {
			// Ignore errors - usually already signed out
		}
		localStorage.removeItem(getStorageKey(JWT_STORAGE_KEY, url));
		localStorage.removeItem(getStorageKey(REFRESH_TOKEN_STORAGE_KEY, url));
		client.clearAuth();
	}

	return { signIn, signOut };
}

export function setupConvexAuth(url: string) {
	setContext(AUTH_URL_CONTEXT_KEY, url);

	if (!browser) return;

	const client = useConvexClient();
	const token = localStorage.getItem(getStorageKey(JWT_STORAGE_KEY, url));

	if (token) {
		setAuthFetcher(client, url);
	}
}
