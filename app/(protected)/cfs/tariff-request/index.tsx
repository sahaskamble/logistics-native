import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listTariffRequestRequests } from "@/lib/actions/cfs/tariffRequest";

export default function TariffRequestRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Tariff Request"
      basePath="/(protected)/cfs/tariff-request"
      listRequests={listTariffRequestRequests}
    />
  );
}
