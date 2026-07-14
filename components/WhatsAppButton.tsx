"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WHATSAPP_NUMBER = "971504301555"; // no + or spaces, as required by wa.me

export default function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with flowork on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.4, ease: "backOut" }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-6 right-6 z-50 h-14 w-14"
    >
      {/* Expanding pulse ring, ported from the reference build's fabRing keyframes */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[#25D366]"
        animate={{ scale: [1, 1.75], opacity: [0.55, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Gentle breathing scale on the button itself */}
      <motion.span
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg"
        animate={{ scale: [1, 1.09, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <MessageCircle size={26} className="text-white" />
      </motion.span>
    </motion.a>
  );
}