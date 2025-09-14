// Simple logout utility for shop owners
export const logout = () => {
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear any cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  // Redirect to login page
  window.location.href = '/';
};
