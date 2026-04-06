import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Ghost, Construction } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
           animate={{ 
            scale: [1, 1.5, 1],
            x: [0, -50, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-xl w-full text-center relative z-10">
        <Reveal width="100%" direction="up">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-12 inline-block"
          >
            <div className="w-32 h-32 bg-secondary/50 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/10 mx-auto">
              <Ghost className="w-16 h-16 text-primary" />
            </div>
          </motion.div>
        </Reveal>

        <Reveal width="100%" direction="up" delay={0.2}>
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-foreground mb-6 opacity-80 select-none">
            404
          </h1>
        </Reveal>

        <Reveal width="100%" direction="up" delay={0.3}>
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Blueprint <span className="text-primary">Not Found</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto">
              The architecture for this page seems to have shifted or no longer exists in our vault.
            </p>
          </div>
        </Reveal>

        <Reveal width="100%" direction="up" delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 group relative overflow-hidden w-full sm:w-auto" asChild>
              <Link to="/">
                <span className="relative z-10 flex items-center gap-3">
                  <Home className="w-5 h-5" />
                  Return Home
                </span>
                <motion.div 
                  className="absolute inset-0 bg-primary-foreground/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-2 w-full sm:w-auto group" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-2 transition-transform" />
              Go Back
            </Button>
          </div>
        </Reveal>
        
        <Reveal width="100%" direction="up" delay={0.5}>
          <p className="mt-16 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 flex items-center justify-center gap-3">
            <Construction className="w-3 h-3" /> Area Under Reconnaissance
          </p>
        </Reveal>
      </div>
    </div>
  );
};

export default NotFound;
