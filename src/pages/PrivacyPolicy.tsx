import React from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Reveal } from "@/components/shared/Reveal";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy | BuildBazaarX</title>
        <meta name="description" content="Privacy Policy for BuildBazaarX in compliance with the Digital Personal Data Protection Act, 2023." />
        <link rel="canonical" href="https://buildbazaarx.com/privacy-policy" />
      </Helmet>

      <div className="bg-[var(--bg-base)] pt-16 pb-12 md:pt-24 md:pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <Reveal width="100%" direction="up">
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tighter">
              Privacy Policy
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
                  At BuildBazaarX, we are committed to protecting your personal data and respecting your privacy. This Privacy Policy outlines the types of information we collect, how we use it, and the measures we take to keep it secure. This policy is aligned with India's Digital Personal Data Protection Act, 2023.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Data We Collect</h2>
                <p className="mb-4">When you interact with our Platform, we collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Account Information:</strong> Name, email address, phone number, and password.</li>
                  <li><strong>Delivery and Billing Address:</strong> To facilitate the fulfillment and shipping of orders.</li>
                  <li><strong>Payment Details:</strong> Transaction IDs and payment status. We do not store full credit card numbers or UPI PINs; these are processed securely by our authorized payment gateways (e.g., Razorpay).</li>
                  <li><strong>Browsing Data:</strong> IP addresses, browser types, device information, and interaction data using cookies to improve your user experience.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Purpose of Collection</h2>
                <p className="mb-4">We use your personal data to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Process and fulfill your orders for materials or design services.</li>
                  <li>Communicate with you regarding order updates, customer support, and promotional offers.</li>
                  <li>Improve our platform's functionality and user interface.</li>
                  <li>Prevent fraud, enforce our Terms of Service, and comply with legal obligations.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Third Parties</h2>
                <p className="mb-4">
                  BuildBazaarX does not sell your personal data. We only share necessary data with authorized third parties to provide our services:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Payment Gateways:</strong> Such as Razorpay, for secure processing of payments.</li>
                  <li><strong>Logistics Partners:</strong> For the delivery of raw materials to your specified address.</li>
                  <li><strong>Analytics Providers:</strong> For tracking website traffic and performance to enhance user experience.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Data Retention and Security</h2>
                <p className="mb-4">
                  We retain your personal data only as long as necessary to fulfill the purposes for which it was collected, or as required by law. We employ industry-standard security measures, including data encryption in transit and at rest, and strict access controls to protect your information from unauthorized access.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">6. Your Rights under the DPDP Act, 2023</h2>
                <p className="mb-4">Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Access the personal data we hold about you.</li>
                  <li>Request correction of inaccurate or incomplete data.</li>
                  <li>Withdraw your consent for data processing.</li>
                  <li>Request the erasure of your personal data under certain conditions.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">7. Grievance Redressal</h2>
                <p className="mb-4">
                  If you have any concerns, complaints, or questions regarding this Privacy Policy or your data, please contact our Grievance Officer. We will address your concerns within the timeline prescribed by law.
                </p>
                <div className="bg-[var(--bg-surface)] p-6 rounded-xl mt-4 border border-[var(--border-subtle)]/20">
                  <p className="mb-2"><strong>Grievance Officer:</strong> Rahul Jangid (Founder)</p>
                  <p className="mb-2"><strong>Email:</strong> jangidrahul9829@gmail.com, techie.adi47@gmail.com</p>
                  <p className="mb-2"><strong>Address:</strong> BuildBazaarX, Jangid Mohalla, Nangal Bairsi, Dausa, Rajasthan, Pin 303303</p>
                </div>
              </section>

            </div>
          </Reveal>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
