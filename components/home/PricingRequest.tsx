import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { useRouter } from "expo-router";

interface PricingRequestDialogProps {
  providerId: string;
  className?: string;
}

export default function PricingRequestDialog({ providerId, className }: PricingRequestDialogProps) {
  const router = useRouter();

  const handleRequestPricing = () => {
    router.push(`/(protected)/pricing-request/${providerId}/create`);
  };

  return (
    <Button className={className} onPress={handleRequestPricing}>
      <Text>Request Pricing</Text>
    </Button>
  );
}

