import RoutePageTemplate from "./shared/RoutePageTemplate";
import useBuses from "../../hooks/bushook";
import { createBus, deleteBus, updateBus } from "../../api/busApi";
import fetchUser from "../../hooks/userhook";
import { hasPermission } from "../../utils/rbac";

export default function BusPage() {
  const { profile } = fetchUser();
  const { buses, loading, refresh } = useBuses();

  // ── Permission helpers ──────────────────────────────────────────────────────
  const canCreate = hasPermission(profile, "bus.create");
  const canUpdate = hasPermission(profile, "bus.update");
  const canDelete = hasPermission(profile, "bus.delete");
  const canRead = hasPermission(profile, "bus.read");
  // ───────────────────────────────────────────────────────────────────────────
    if (!canRead) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        You don't have permission to view buses.
      </div>
    );
  }
  return (
    <RoutePageTemplate
      title="Bus Route"
      data={buses}
      loading={loading}
      fetchFn={refresh}
      createFn={createBus}
      updateFn={updateBus}
      deleteFn={deleteBus}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      placeholder={{
        routeNumber: "201",
        stops: "Stop A, Stop B",
      }}
    />
  );
}
