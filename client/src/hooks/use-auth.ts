import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}
