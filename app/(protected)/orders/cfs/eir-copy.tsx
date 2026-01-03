import { ScrollView } from "react-native";
import CfsServiceRequestForm from "@/components/cfs/CfsServiceRequestForm";

export default function CfsEirCopyPage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <CfsServiceRequestForm
        serviceTitle="CFS"
        presetServiceTypeTitle="EIR Copy"
        submitLabel="Submit EIR Copy Request"
      />
    </ScrollView>
  );
}

