import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createOneTimeTariffRequest } from "@/lib/actions/cfs/oneTimeTariff";

export default function OneTimeTariffCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="One Time Tariff"
      basePath="/(protected)/cfs/one-time-tariff"
      createRequest={createOneTimeTariffRequest}
    />
  );
}
