import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "accent" | "ghost" | "link";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-canvas hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]",
            secondary: "border border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/50",
            accent: "bg-accent-b text-black hover:bg-accent-b hover:shadow-[0_0_20px_rgba(204,255,0,1)]",
            ghost: "text-primary/60 hover:text-primary hover:bg-primary/5",
            link: "text-accent-a hover:underline underline-offset-4",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-5 text-sm",
            lg: "h-12 px-8 text-base",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider font-mono",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
