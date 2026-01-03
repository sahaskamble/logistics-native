import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { useRouter } from "expo-router";

interface PricingRequestDialogProps {
  providerId: string;
}

export default function PricingRequestDialog({ providerId }: PricingRequestDialogProps) {
  const router = useRouter();

  const handleRequestPricing = () => {
    router.push(`/(protected)/pricing-request/${providerId}/create`);
  };

  return (
    <Button onPress={handleRequestPricing}>
      <Text>Request Pricing</Text>
    </Button>
  );
}

