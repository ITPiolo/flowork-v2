"use client";

import { createContext, useContext, useState } from "react";

type EnquiryDrawerContextValue = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const EnquiryDrawerContext = createContext<EnquiryDrawerContextValue | null>(null);

export function EnquiryDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <EnquiryDrawerContext.Provider
      value={{ open, openDrawer: () => setOpen(true), closeDrawer: () => setOpen(false) }}
    >
      {children}
    </EnquiryDrawerContext.Provider>
  );
}

export function useEnquiryDrawer() {
  const ctx = useContext(EnquiryDrawerContext);
  if (!ctx) throw new Error("useEnquiryDrawer must be used within EnquiryDrawerProvider");
  return ctx;
}
