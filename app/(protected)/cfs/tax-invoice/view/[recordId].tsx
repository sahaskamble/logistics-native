import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getTaxInvoiceRequestById } from "@/lib/actions/cfs/taxInvoice";

export default function TaxInvoiceViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Tax Invoice"
      basePath="/(protected)/cfs/tax-invoice"
      getRequestById={getTaxInvoiceRequestById}
    />
  );
}
