let activeRefresh = null;

export const refreshSession = (baseUrl, refreshToken) => {
  if (!activeRefresh) {
    activeRefresh = fetch(`${baseUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
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
