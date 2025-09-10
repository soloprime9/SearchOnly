"use client";
import { useState } from "react";
import WhatsAppPopup from "@/components/WhatsAppPopup";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";

export default function WhatsAppClientUI() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  return (
    <>
      <WhatsAppPopup onPopupStateChange={setIsPopupVisible} />
      <FloatingWhatsAppButton isPopupVisible={isPopupVisible} />
    </>
  );
}
