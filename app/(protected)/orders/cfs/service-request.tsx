import { ScrollView } from "react-native";
import CfsServiceRequestForm from "@/components/cfs/CfsServiceRequestForm";

export default function CfsServiceRequestPage() {
  return (
    <ScrollView className="flex-1 bg-background">
      <CfsServiceRequestForm serviceTitle="CFS" submitLabel="Submit CFS Request" />
    </ScrollView>
  );
}

