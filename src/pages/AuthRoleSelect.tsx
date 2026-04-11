import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Home, Wrench, Palette, Package, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";

export const AuthRoleSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get("mode") === "login";

  const roles = [
    {
      id: "customer",
      icon: Home,
      title: "Client Portal",
      description: "Browse curated designs and procure raw materials for your next project.",
      path: "/auth",
    },
    {
      id: "designer",
      icon: Palette,
      title: "Architect & Designer Access",
      description: "Deploy your original blueprints to our verified network of clients.",
      path: "/designer/auth",
    },
    {
      id: "professional",
      icon: Wrench,
      title: "Professional Registry",
      description: "Secure contracts for execution and structural implementation.",
      path: "/professional/auth",
    },
    {
      id: "supplier",
      icon: Package,
      title: "Logistics & Supply Chain",
      description: "Fulfill premium material requisitions directly to verified sites.",
      path: "/supplier/auth",
    },
  ];

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        .font-headline { font-family: 'Newsreader', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>
      
      <div className="bg-[#fcf9f6] text-[#1c1c1a] min-h-screen font-body w-full pb-20 relative">
        {/* Subtle grid background to match the "blueprint" aesthetic in a muted way */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e2df 1px, transparent 1px), linear-gradient(90deg, #e5e2df 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
        
        <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10">
          
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
            
            {/* Header Area */}
            <div className="w-full md:w-1/3 shrink-0 sticky top-32">
               <span className="font-body uppercase tracking-[0.2em] text-[10px] text-[#735c00] mb-4 block font-bold">Authentication Protocol</span>
               <h1 className="text-6xl md:text-7xl font-headline tracking-tight leading-none mb-6">
                {isLogin ? "System" : "Platform"} <br/><span className="italic">Access.</span>
              </h1>
               <div className="w-12 h-[1px] bg-[#c4c6cc] mb-6"></div>
              <p className="text-lg font-body text-[#44474c] leading-relaxed max-w-sm">
                {isLogin 
                  ? "Select your verified sector to securely enter the dashboard and manage operations." 
                  : "Establish your identity within the network. Select the appropriate operational sector to begin."}
              </p>
            </div>

            {/* Roles Grid */}
            <div className="w-full md:w-2/3">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <motion.div
                      key={role.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="cursor-pointer group flex flex-col h-full"
                      onClick={() => navigate(`${role.path}?mode=${isLogin ? 'login' : 'register'}`)}
                    >
                      <article className="p-8 md:p-10 bg-[#f6f3f0] border border-[#e5e2df] group-hover:border-[#735c00] transition-colors rounded-sm flex-grow flex flex-col relative overflow-hidden">
                        
                        <div className="mb-12">
                          <div className="w-12 h-12 rounded-full bg-[#e5e2df] flex items-center justify-center mb-6 group-hover:bg-[#1c1c1a] transition-colors">
                            <Icon className="w-5 h-5 text-[#1c1c1a] group-hover:text-white transition-colors" />
                          </div>
                          <h3 className="text-2xl font-headline font-semibold text-[#1c1c1a] leading-tight mb-3">
                            {role.title}
                          </h3>
                          <p className="font-body text-[#44474c] text-sm leading-relaxed">
                            {role.description}
                          </p>
                        </div>
                        
                        <div className="mt-auto border-t border-[#e5e2df] pt-6 flex justify-between items-center group-hover:border-[#735c00] transition-colors">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#735c00]">
                            {isLogin ? "Authenticate" : "Initialize Registration"}
                          </span>
                          <div className="w-8 h-8 rounded-full border border-[#c4c6cc] group-hover:border-[#735c00] flex items-center justify-center group-hover:bg-[#735c00] group-hover:text-white transition-all">
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>

                      </article>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

          </div>
        </main>
      </div>
    </Layout>
  );
};

export default AuthRoleSelect;
