"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEnquiryDrawer } from "@/lib/EnquiryDrawerContext";
import EnquiryForm from "@/components/EnquiryForm";

export default function EnquirySidebar() {
  const { open, closeDrawer } = useEnquiryDrawer();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-charcoal/50"
            onClick={closeDrawer}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] z-[301] overflow-y-auto bg-cream shadow-2xl"
          >
            <div className="p-4 flex justify-end sticky top-0 bg-cream z-10">
              <button
                onClick={closeDrawer}
                aria-label="Close enquiry form"
                className="text-charcoal/60 hover:text-charcoal rounded-full p-1.5 hover:bg-charcoal/5"
              >
                <X size={22} />
              </button>
            </div>
            <div className="px-4 sm:px-5 pb-10">
              <EnquiryForm anchorId={null} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
