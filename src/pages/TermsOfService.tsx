import React from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Reveal } from "@/components/shared/Reveal";

const TermsOfService = () => {
  return (
    <Layout>
      <Helmet>
        <title>Terms of Service | BuildBazaarX</title>
        <meta name="description" content="Terms and Conditions for BuildBazaarX." />
        <link rel="canonical" href="https://buildbazaarx.com/terms-of-service" />
      </Helmet>

      <div className="bg-[var(--bg-base)] pt-16 pb-12 md:pt-24 md:pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <Reveal width="100%" direction="up">
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tighter">
              Terms of Service
            </h1>
            <p className="text-[var(--text-secondary)] font-medium mb-10">
              Effective Date: June 23, 2026
            </p>
          </Reveal>

          <Reveal width="100%" direction="up" delay={0.1}>
            <div className="bg-[var(--bg-card)] rounded-[2rem] p-8 md:p-12 border border-[var(--border-subtle)]/10 shadow-xl prose prose-invert max-w-none prose-p:text-[var(--text-secondary)] prose-h2:text-[var(--text-primary)] prose-h3:text-[var(--text-primary)] prose-li:text-[var(--text-secondary)]">
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="mb-4">
                  Welcome to BuildBazaarX ("Platform"). These Terms of Service ("Terms") govern your use of the BuildBazaarX website, mobile application, and any related services. By accessing or using our Platform, you agree to be bound by these Terms.
                </p>
                <p className="mb-4">
                  The Platform is operated by <strong>BuildBazaarX</strong>, registered at <strong>Jangid Mohalla, Nangal Bairsi, Dausa, Rajasthan, Pin 303303</strong>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Platform:</strong> Refers to the BuildBazaarX website and associated applications.</li>
                  <li><strong>User:</strong> Any individual or entity that accesses or uses the Platform.</li>
                  <li><strong>Buyer:</strong> A User who purchases raw materials, designs, or services through the Platform.</li>
                  <li><strong>Seller:</strong> A vendor or manufacturer listing raw materials for sale on the Platform.</li>
                  <li><strong>Professional/Vendor:</strong> Architects, interior designers, or contractors offering services via the Platform.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Marketplace Role Disclaimer</h2>
                <p className="mb-4">
                  BuildBazaarX operates as an intermediary technology platform connecting Buyers, Sellers, and Professionals. We facilitate transactions but do not manufacture, store, or take ownership of the physical goods listed by Sellers, nor do we directly perform the professional services listed by vendors, unless explicitly stated otherwise. BuildBazaarX is not liable for any defects in products sold by third-party Sellers or deficiency in services provided by third-party Professionals.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. User Eligibility and Responsibilities</h2>
                <p className="mb-4">
                  You must be at least 18 years of age to use the Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when registering or making purchases.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Payment Terms and Order Processing</h2>
                <p className="mb-4">
                  All payments are securely processed through authorized third-party payment gateways. BuildBazaarX and its Sellers reserve the right to accept or reject any order at our sole discretion, including cases where materials are out of stock or there are pricing errors. In the event of order rejection, any payments made will be fully refunded to the original source.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
                <p className="mb-4">
                  All content, designs, logos, text, and graphics on the Platform are the intellectual property of BuildBazaarX or its licensors. You may not reproduce, distribute, or create derivative works from this content without our express written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
                <p className="mb-4">
                  To the maximum extent permitted by law, BuildBazaarX shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of your use of the Platform, or your inability to use the Platform. Our total liability for any claim arising out of these Terms shall not exceed the amount paid by you for the specific transaction giving rise to the claim.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">8. Dispute Resolution and Governing Law</h2>
                <p className="mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these Terms or the use of the Platform shall be subject to the exclusive jurisdiction of the courts located in <strong>Jaipur, Rajasthan</strong>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">9. Modifications to Terms</h2>
                <p className="mb-4">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on the Platform. Your continued use of the Platform constitutes your acceptance of the revised Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions regarding these Terms, please contact us at:
                </p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> techie.adi47@gmail.com, jangidrahul9829@gmail.com</li>
                  <li><strong>Phone:</strong> +91 9521259456, +91 7309958494</li>
                  <li><strong>Address:</strong> Jangid Mohalla, Nangal Bairsi, Dausa, Rajasthan, Pin 303303</li>
                </ul>
              </section>

            </div>
          </Reveal>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
