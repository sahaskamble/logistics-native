import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getReScanningRequestById, updateReScanningRequest } from "@/lib/actions/cfs/reScanning";

export default function ReScanningEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Re-Scanning"
      basePath="/(protected)/cfs/re-scanning"
      getRequestById={getReScanningRequestById}
      updateRequest={updateReScanningRequest}
    />
  );
}
