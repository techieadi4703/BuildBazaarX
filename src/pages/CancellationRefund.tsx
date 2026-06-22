import React from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Reveal } from "@/components/shared/Reveal";

const CancellationRefund = () => {
  return (
    <Layout>
      <Helmet>
        <title>Cancellation and Refund Policy | BuildBazaarX</title>
        <meta name="description" content="Cancellation and refund policies for orders placed on BuildBazaarX." />
        <link rel="canonical" href="https://buildbazaarx.com/cancellation-and-refund" />
      </Helmet>

      <div className="bg-[var(--bg-base)] pt-16 pb-12 md:pt-24 md:pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <Reveal width="100%" direction="up">
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tighter">
              Cancellation & Refund Policy
            </h1>
            <p className="text-[var(--text-secondary)] font-medium mb-10">
              Effective Date: June 23, 2026
            </p>
          </Reveal>

          <Reveal width="100%" direction="up" delay={0.1}>
            <div className="bg-[var(--bg-card)] rounded-[2rem] p-8 md:p-12 border border-[var(--border-subtle)]/10 shadow-xl prose prose-invert max-w-none prose-p:text-[var(--text-secondary)] prose-h2:text-[var(--text-primary)] prose-h3:text-[var(--text-primary)] prose-li:text-[var(--text-secondary)]">
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Order Cancellation Window</h2>
                <p className="mb-4">
                  You may cancel your order for a full refund within <strong>24 hours</strong> of placing it, provided the order has not yet been shipped or, in the case of services, the work has not yet commenced. 
                </p>
                <p className="mb-4">
                  To cancel an order, please visit the "Orders" section in your Profile dashboard or contact our support team immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Refund Processing Timeline</h2>
                <p className="mb-4">
                  Once a cancellation is approved or a return is received and inspected, we will initiate the refund. 
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Refunds will be processed within <strong>5–7 business days</strong>.</li>
                  <li>The amount will be credited back to the <strong>original payment method</strong> used during the purchase.</li>
                  <li>In some cases, your bank or credit card issuer may take additional days to reflect the amount in your account.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Non-Refundable Items & Categories</h2>
                <p className="mb-4">
                  Due to the nature of the construction and design industry, certain items and services are strictly non-refundable:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Custom-cut raw materials (e.g., customized steel, glass, or cut timber).</li>
                  <li>Made-to-order furniture and fixtures.</li>
                  <li>Bulk cement or perishable construction materials once delivered.</li>
                  <li>Professional design fees for services where the architectural or interior design work has already commenced.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Partial Refunds</h2>
                <p className="mb-4">
                  In scenarios where an order is partially shipped, or if only part of a bundled service has been utilized before cancellation, BuildBazaarX reserves the right to issue a partial refund corresponding to the unfulfilled portion of the order.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. How to Raise a Request</h2>
                <p className="mb-4">
                  If you need to request a cancellation or refund, please reach out to our support team:
                </p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> techie.adi47@gmail.com, jangidrahul9829@gmail.com</li>
                  <li><strong>Phone:</strong> +91 9521259456</li>
                  <li><strong>Support Hours:</strong> Monday - Saturday, 10 AM – 7 PM</li>
                </ul>
              </section>

            </div>
          </Reveal>
        </div>
      </div>
    </Layout>
  );
};

export default CancellationRefund;
