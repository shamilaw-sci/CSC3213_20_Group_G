import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Kandyan Culture Connect",
  description: "Our return and refund policy for KCC purchases.",
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-stone-50 min-h-screen py-16 px-6 lg:px-8 pt-32 md:pt-40">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-stone-900 mb-4">Refund Policy</h1>
          <p className="text-stone-500">Last updated: June 2026</p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-200 text-stone-600 leading-relaxed space-y-8">
          
          <section>
            <p>
              Thank you for shopping at <strong>Kandyan Cultural Center (KCC)</strong>. We value your satisfaction and strive to provide you with the best online shopping experience possible. If, for any reason, you are not completely satisfied with your purchase, we are here to help.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">Returns</h2>
            <p>
              We accept returns within <strong>14 days</strong> from the date of purchase. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">Refunds</h2>
            <p>
              Once we receive your return and inspect the item, we will notify you of the status of your refund. If your return is approved, we will initiate a refund to your original method of payment. Please note that the refund amount will exclude any shipping charges incurred during the initial purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">Exchanges</h2>
            <p>
              If you would like to exchange your item for a different size, color, or style, please contact our customer support team within <strong>14 days</strong> of receiving your order. We will provide you with further instructions on how to proceed with the exchange.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">Non-Returnable Items</h2>
            <p className="mb-2">Certain items are non-returnable and non-refundable. These include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gift cards</li>
              <li>Downloadable software or digital products</li>
              <li>Personalized or custom-made artifact orders</li>
              <li>Perishable goods</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">Damaged or Defective Items</h2>
            <p>
              In the unfortunate event that your item arrives damaged or defective, please contact us immediately. We will arrange for a replacement or issue a refund, depending on your preference and product availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">Return Shipping</h2>
            <p>
              You will be responsible for paying the shipping costs for returning your item unless the return is due to our error (e.g., wrong item shipped, defective product). In such cases, we will provide you with a prepaid shipping label.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">Processing Time</h2>
            <p>
              Refunds and exchanges will be processed within <strong>5-7 business days</strong> after we receive your returned item. Please note that it may take additional time for the refund to appear in your account, depending on your payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">Contact Us</h2>
            <p>
              If you have any questions or concerns regarding our refund policy, please contact our customer support team. We are here to assist you and ensure your shopping experience with us is enjoyable and hassle-free.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}