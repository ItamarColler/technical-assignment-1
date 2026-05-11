import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipBase = TooltipPrimitive;

function TooltipContent({ className, ...props }: TooltipPrimitive.Popup.Props) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={6}>
        <TooltipPrimitive.Popup
          className={cn(
            "z-50 max-w-55 px-2.5 py-1.5 text-xs font-mono rounded-md",
            "bg-card border border-border/80 text-foreground shadow-lg",
            "transition-all duration-150 ease-out",
            "data-starting-style:opacity-0 data-[starting-style]:-translate-y-0.5",
            "data-ending-style:opacity-0",
            className
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { TooltipContent };
