import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getOneTimeTariffRequestById } from "@/lib/actions/cfs/oneTimeTariff";

export default function OneTimeTariffViewPage() {
  return (
    <ServiceRequestViewScreen
      title="One Time Tariff"
      basePath="/(protected)/cfs/one-time-tariff"
      getRequestById={getOneTimeTariffRequestById}
    />
  );
}
