let activeRefresh = null;

export const refreshSession = (baseUrl) => {
  if (!activeRefresh) {
    activeRefresh = fetch(`${baseUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ client: "admin" }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result?.data?.accessToken || !result?.data?.refreshToken) return null;
        return result.data;
      })
      .catch(() => null)
      .finally(() => {
        activeRefresh = null;
      });
  }
  return activeRefresh;
};
