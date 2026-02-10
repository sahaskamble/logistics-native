import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Plus } from "lucide-react-native";

export interface AddNewContainerButtonProps {
  onPress: () => void;
}

export function AddNewContainerButton({ onPress }: AddNewContainerButtonProps) {
  return (
    <Button onPress={onPress} className="w-full rounded-xl" size="lg">
      <Icon as={Plus} size={20} className="mr-2 text-white" />
      <Text>Add New Container</Text>
    </Button>
  );
}
