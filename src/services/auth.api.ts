export const loginWithGithub = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.wjdalswo.xyz";
  window.location.href = `${backendUrl}/auth/oauth?type=github`;
};
