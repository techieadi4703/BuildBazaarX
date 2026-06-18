import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--bg-card)] group-[.toaster]:text-[var(--text-primary)] group-[.toaster]:border-[var(--border-subtle)] group-[.toaster]:shadow-[0_40px_100px_rgba(0,0,0,0.3)]",
          description: "group-[.toast]:text-[var(--text-secondary)]",
          actionButton: "group-[.toast]:bg-[var(--accent)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[var(--bg-surface)] group-[.toast]:text-[var(--text-secondary)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
