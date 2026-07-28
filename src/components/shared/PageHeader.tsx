import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  crumb: string;
  subtitle?: string;
}

export const PageHeader = ({ title, crumb, subtitle }: PageHeaderProps) => {
  return (
    <section className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]/60">
      <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)] mb-4">
            <Link to="/" className="hover:text-[var(--accent-warm)] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--text-secondary)]">{crumb}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-[var(--text-primary)] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-xl text-[var(--text-secondary)] text-sm md:text-base">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};
