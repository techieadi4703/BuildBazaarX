import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    chatbase?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

/**
 * Custom floating chat launcher, styled with our own icon.
 * The actual conversation UI is still powered by Chatbase (loaded in index.html);
 * this button simply replaces the stock bubble and opens the widget via the
 * official window.chatbase("open") command.
 */
export const ChatLauncher = () => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 3200);
    const hide = setTimeout(() => setShowHint(false), 8200);
    return () => {
      clearTimeout(t);
      clearTimeout(hide);
    };
  }, []);

  const openChat = () => {
    setShowHint(false);
    try {
      window.chatbase?.("open");
    } catch {
      // Widget not ready yet — no-op, user can retry.
    }
  };

  return (
    <div className="fixed bottom-20 right-5 lg:bottom-7 md:right-7 z-[45] flex items-end gap-3">
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="hidden sm:block mb-1 px-4 py-2.5 rounded-2xl rounded-br-sm bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] text-sm text-[var(--text-primary)] max-w-[200px]"
          >
            Need help? Chat with us 👋
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={openChat}
        aria-label="Open chat support"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-white shadow-[0_8px_28px_rgba(26,61,124,0.35)] border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden"
      >
        {/* Subtle pulsing ring for premium presence */}
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/30"
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <img
          src="/chatbot-icon.png"
          alt="Chat with BuildBazaarX"
          className="w-9 h-9 md:w-10 md:h-10 object-contain relative z-10"
        />
      </motion.button>
    </div>
  );
};

export default ChatLauncher;
