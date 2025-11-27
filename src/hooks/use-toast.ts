"use client";

import { useToast as useToastFromProvider } from "@/components/providers/toast-provider";

export function useToast() {
  return useToastFromProvider();
}
