export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const isLoggedIn = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    return true;
  } catch {
    return false;
  }
};

