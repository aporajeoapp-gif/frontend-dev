import RoutePageTemplate from "./shared/RoutePageTemplate";
import useFerries from "../../hooks/ferryhook";
import { createFerry, deleteFerry, updateFerry } from "../../api/ferryApi";
import fetchUser from "../../hooks/userhook";
import { hasPermission } from "../../utils/rbac";

export default function FerryPage() {
  const { profile } = fetchUser();
  const { ferries, loading, refresh } = useFerries();

  // ── Permission helpers ──────────────────────────────────────────────────────
  const canCreate = hasPermission(profile, "ferry.create");
  const canUpdate = hasPermission(profile, "ferry.update");
  const canDelete = hasPermission(profile, "ferry.delete");
  const canRead = hasPermission(profile, "ferry.read");
  // ───────────────────────────────────────────────────────────────────────────
  if (!canRead) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        You don't have permission to view ferry page.
      </div>
    );
  }
  return (
    <RoutePageTemplate
      title="Ferry Route"
      data={ferries}
      loading={loading}
      fetchFn={refresh}
      createFn={createFerry}
      updateFn={updateFerry}
      deleteFn={deleteFerry}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      placeholder={{
        routeNumber: "F1",
        stops: "Ghat A, Ghat B",
      }}
    />
  );
}
