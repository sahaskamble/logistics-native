import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getTariffRequestById } from "@/lib/actions/cfs/tariffRequest";

export default function TariffRequestViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Tariff Request"
      basePath="/(protected)/cfs/tariff-request"
      getRequestById={getTariffRequestById}
    />
  );
}
