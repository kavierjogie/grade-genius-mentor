import logo from "@/assets/careerbuddy-logo.png";
import { cn } from "@/lib/utils";

export function BuddyMark({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="CareerBuddy SA logo"
      className={cn("h-9 w-9 select-none", className)}
    />
  );
}

export function BuddyWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BuddyMark />
      <span className="font-display text-lg leading-none font-extrabold tracking-tight">
        CareerBuddy
        <span className="ml-1 rounded-md bg-highlight px-1.5 py-0.5 text-[10px] align-middle text-highlight-foreground">
          SA
        </span>
      </span>
    </span>
  );
}
