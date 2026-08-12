import { trpc } from "@/lib/trpc";

export function useAuth() {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      meQuery.refetch();
    },
  });

  const user = meQuery.data ?? null;

  return {
    user,
    loading: meQuery.isLoading,
    error: meQuery.error ?? null,
    isAuthenticated: !!user,
    logout: async () => {
      await logoutMutation.mutateAsync();
      await meQuery.refetch();
    },
  };
}
