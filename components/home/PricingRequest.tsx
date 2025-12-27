import { View } from "react-native";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../ui/dialog";
import { Text } from "../ui/text";
import { useState } from "react";
import pb from "@/lib/pocketbase/pb";
import { getCurrentUser } from "@/lib/actions/users";

export default function PricingRequestDialog() {
  const [formData, setFormData] = useState({
    user: '',
    serviceProvider: '',
    containerType: '',
    delayType: '',
    status: '',
    extra_info: {
      'twentyft': {
        clicked: false,
        preferableRate: "",
        containerPerMonths: "",
        freeGroundRentDays: "",
        agreedAmount: "",
        billingAmount: "",
        groundrentFreeDays: "",
      },
      'fortyft': {
        clicked: false,
        preferableRate: "",
        containerPerMonths: "",
        freeGroundRentDays: "",
        agreedAmount: "",
        billingAmount: "",
        groundrentFreeDays: "",
      },
    },
  });

  async function handleSubmitPricingRequest() {
    try {

    } catch (err) {
      console.error("Error Submitting Pricing Request", err);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Text>Request Pricing</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <Text>Pricing Request</Text>
        </DialogHeader>
        <View className="w-full">
        </View>
      </DialogContent>
    </Dialog>
  )
}

