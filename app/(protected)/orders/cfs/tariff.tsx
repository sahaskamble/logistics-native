import { ScrollView } from "react-native";
import CfsServiceRequestForm from "@/components/cfs/CfsServiceRequestForm";

export default function CfsTariffPage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <CfsServiceRequestForm
        serviceTitle="CFS"
        presetServiceTypeTitle="Tariff Request"
        submitLabel="Submit Tariff Request"
      />
    </ScrollView>
  );
}

