import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, MessageCircle, FileText, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HelpTab() {
  const faqs = [
    {
      q: "How do I list my first product?",
      a: "Go to the 'My Listings' tab and click on the 'Add New Product' button. Fill in the required details including product name, price, category, and images. Once complete, you can either save it as a draft or publish it immediately to the marketplace."
    },
    {
      q: "When will I receive payment?",
      a: "Payments are processed on a weekly cycle. For orders delivered between Monday and Sunday, the payout is initiated on the following Wednesday to your linked bank account."
    },
    {
      q: "How are inquiries handled?",
      a: "When a buyer requests a bulk quantity, it appears in your 'Inquiries' tab. You should contact the buyer via Phone or WhatsApp to negotiate and finalize the deal. Once done, you can update the status to 'Fulfilled'."
    },
    {
      q: "What is the commission structure?",
      a: "BuildBazaarX charges a flat 5% commission on the final selling price for completed orders. Bulk inquiries negotiated directly with buyers do not incur any commission."
    },
    {
      q: "How do I update my bank details?",
      a: "Navigate to the 'Payments' tab where you can view and update your linked bank account information. Changes will take 48 hours to be verified."
    },
    {
      q: "Who do I contact for disputes?",
      a: "If you have an issue with an order, buyer, or payout, please reach out to our Seller Support team using the contact options below. Include your Order ID for faster resolution."
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="bg-[#735c00] text-white p-8 rounded-xl shadow-md text-center">
        <LifeBuoy className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <h2 className="text-3xl font-headline font-bold mb-2">Seller Support Center</h2>
        <p className="text-white/80 max-w-lg mx-auto">We're here to help you grow your business. Browse our FAQs or contact our dedicated support team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#e5e2df] shadow-sm">
            <h3 className="font-headline text-xl font-semibold mb-6">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-[#e5e2df]">
                  <AccordionTrigger className="text-left font-medium hover:text-[#735c00] hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#74777d] leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#e5e2df] shadow-sm">
            <h3 className="font-headline text-lg font-semibold mb-4">Contact Support</h3>
            <div className="space-y-4">
              <a href="mailto:support@buildbazaarx.com" className="flex items-center gap-3 p-3 rounded-md bg-[#fcf9f6] hover:bg-[#e5e2df]/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#e5e2df] group-hover:border-[#735c00]">
                  <Mail className="w-5 h-5 text-[#735c00]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1c1c1a]">Email Us</p>
                  <p className="text-xs text-[#74777d]">support@buildbazaarx.com</p>
                </div>
              </a>
              
              <a href="https://wa.me/919521259456" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-[#fcf9f6] hover:bg-[#e5e2df]/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1c1c1a]">WhatsApp Support</p>
                  <p className="text-xs text-[#74777d]">Mon-Sat, 9am - 6pm</p>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#e5e2df] shadow-sm">
            <h3 className="font-headline text-lg font-semibold mb-4">Policies</h3>
            <Button variant="outline" className="w-full justify-start text-[#74777d] hover:text-[#1c1c1a] mb-2">
              <FileText className="w-4 h-4 mr-2" /> Seller Agreement
            </Button>
            <Button variant="outline" className="w-full justify-start text-[#74777d] hover:text-[#1c1c1a]">
              <FileText className="w-4 h-4 mr-2" /> Return Policy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
