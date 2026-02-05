import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listOneTimeTariffRequests } from "@/lib/actions/cfs/oneTimeTariff";

export default function OneTimeTariffRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="One Time Tariff"
      basePath="/(protected)/cfs/one-time-tariff"
      listRequests={listOneTimeTariffRequests}
    />
  );
}
