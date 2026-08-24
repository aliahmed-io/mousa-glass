import { trpc } from "@/lib/trpc";
import { useAuth } from "./useAuth";

export function useAdminAccess() {
  const auth = useAuth();
  const roleAdmin = auth.user?.role === "admin";
  const access = trpc.auth.adminAccess.useQuery(undefined, {
    enabled: Boolean(auth.user) && !roleAdmin,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...auth,
    authorized: roleAdmin || access.data?.authorized === true,
    loading: auth.loading || (Boolean(auth.user) && !roleAdmin && access.isLoading),
  };
}
