import React from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Reveal } from "@/components/shared/Reveal";

const ShippingExchange = () => {
  return (
    <Layout>
      <Helmet>
        <title>Shipping and Exchange Policy | BuildBazaarX</title>
        <meta name="description" content="Shipping details, delivery timelines, and exchange policies for BuildBazaarX." />
        <link rel="canonical" href="https://buildbazaarx.com/shipping-and-exchange" />
      </Helmet>

      <div className="bg-[var(--bg-base)] pt-16 pb-12 md:pt-24 md:pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <Reveal width="100%" direction="up">
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tighter">
              Shipping & Exchange Policy
            </h1>
            <p className="text-[var(--text-secondary)] font-medium mb-10">
              Effective Date: June 23, 2026
            </p>
          </Reveal>

          <Reveal width="100%" direction="up" delay={0.1}>
            <div className="bg-[var(--bg-card)] rounded-[2rem] p-8 md:p-12 border border-[var(--border-subtle)]/10 shadow-xl prose prose-invert max-w-none prose-p:text-[var(--text-secondary)] prose-h2:text-[var(--text-primary)] prose-h3:text-[var(--text-primary)] prose-li:text-[var(--text-secondary)]">
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Serviceable Areas</h2>
                <p className="mb-4">
                  Currently, BuildBazaarX processes orders and provides shipping and delivery services exclusively within <strong>Jaipur, Rajasthan</strong>. We are actively working to expand our logistics network to other cities soon.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Delivery Timelines</h2>
                <p className="mb-4">
                  Delivery timelines vary based on the category of the item ordered:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Standard Raw Materials (e.g., standard bricks, pre-mixed cement):</strong> Typically delivered within <strong>3-5 business days</strong>.</li>
                  <li><strong>Specialized/Heavy Materials:</strong> May take <strong>5-7 business days</strong> due to special transit requirements.</li>
                  <li><strong>Custom/Made-to-Order Items:</strong> Delivery timelines will be communicated directly at the time of order confirmation, as these require manufacturing lead time.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Shipping Charges</h2>
                <p className="mb-4">
                  Shipping and logistics charges are calculated based on the weight, volume of the materials, and the delivery distance within Jaipur. Exact shipping costs will be displayed at checkout before payment.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Exchange Eligibility & Window</h2>
                <p className="mb-4">
                  We accept exchanges strictly under the following conditions:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>You received an incorrect item that does not match your order.</li>
                  <li>The item was delivered in a physically damaged or defective condition.</li>
                </ul>
                <p className="mb-4">
                  You must raise an exchange request within <strong>7 days</strong> of delivery. The item must be unused, in its original packaging, and in the same condition that you received it.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Process to Initiate an Exchange</h2>
                <p className="mb-4">
                  If you receive a damaged or incorrect item, please take clear photographs of the product and the packaging immediately upon delivery. 
                </p>
                <p className="mb-4">
                  Email the photos along with your Order ID to <strong>jangidrahul9829@gmail.com</strong> or contact us at <strong>+91 9521259456</strong>. Our team will verify the claim and arrange for a reverse pickup and subsequent replacement at no additional cost.
                </p>
              </section>

            </div>
          </Reveal>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingExchange;
