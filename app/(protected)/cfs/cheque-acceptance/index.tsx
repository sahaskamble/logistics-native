import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listChequeAcceptanceRequests } from "@/lib/actions/cfs/chequeAcceptance";

export default function ChequeAcceptanceRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Cheque Acceptance"
      basePath="/(protected)/cfs/cheque-acceptance"
      listRequests={listChequeAcceptanceRequests}
    />
  );
}
