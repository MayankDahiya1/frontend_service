/*
 * EXPORTS
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken"); // true if token exists
};

/*
 * EXPORTS
 */
export const logout = () => {
  localStorage.removeItem("accessToken");
  window.location.href = "/login";
};
