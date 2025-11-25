import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketIconProps extends LucideProps {
  isActive?: boolean;
}

export const MarketIcon = ({ size = 20, className, isActive = false }: MarketIconProps) => {
  const activeColor = "#E20074"; // Pink
  const inactiveColor = "#7A7A7A"; // Gray

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isActive ? activeColor : inactiveColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
    >
      <path d="M2 10l10-7 10 7" />
      <path d="M4 10v11h16V10" />
      <path d="M10 15v6h4v-6" stroke={isActive ? 'black' : activeColor} fill={isActive ? activeColor : 'none'}/>
      <path d="M16 5h3v3h-3z" />
    </svg>
  );
};
