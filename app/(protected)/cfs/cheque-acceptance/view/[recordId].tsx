import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getChequeAcceptanceRequestById } from "@/lib/actions/cfs/chequeAcceptance";

export default function ChequeAcceptanceViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Cheque Acceptance"
      basePath="/(protected)/cfs/cheque-acceptance"
      getRequestById={getChequeAcceptanceRequestById}
    />
  );
}
