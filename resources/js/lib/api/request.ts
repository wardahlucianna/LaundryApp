export async function request<T>(path: string, token: string | null, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`/api${path}`, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message =
            body.message ||
            Object.values(body.errors || {}).flat().join(" ") ||
            "Permintaan gagal.";

        throw new Error(String(message));
    }

    return body as T;
}
