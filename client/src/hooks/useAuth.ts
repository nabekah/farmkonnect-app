import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

/**
 * useAuth hook - Get current user authentication state
 * Returns user object if authenticated, null otherwise
 */
export function useAuth() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
  };
}

/**
 * Get login URL for OAuth
 */
export function getLoginUrl() {
  const oauthUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUrl = `${window.location.origin}/auth/callback`;
  
  return `${oauthUrl}?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUrl)}`;
}

/**
 * Logout user
 */
export function useLogout() {
  const { mutate: logout } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  return logout;
}
