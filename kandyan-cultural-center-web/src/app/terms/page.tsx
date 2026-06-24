import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Kandyan Culture Connect",
  description: "Rules and regulations for using the KCC platform.",
};

export default function TermsPage() {
  return (
    <div className="bg-stone-50 min-h-screen py-16 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-stone-900 mb-4">Terms and Conditions</h1>
          <p className="text-stone-500">Last updated: June 2026</p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-200 text-stone-600 leading-relaxed space-y-8">
          
          <section>
            <p>
              Welcome to <strong>Kandyan Cultural Center (KCC)</strong>. These Terms and Conditions govern your use of our website and the purchase and sale of products from our platform. By accessing and using our website, you agree to comply with these terms. Please read them carefully before proceeding with any transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">1. Use of the Website</h2>
            <ul className="list-[lower-alpha] pl-5 space-y-2">
              <li>You must be at least <strong>15 years old</strong> to use our website or make purchases.</li>
              <li>You are responsible for maintaining the confidentiality of your account information, including your username and password.</li>
              <li>You agree to provide accurate and current information during the registration and checkout process.</li>
              <li>You may not use our website for any unlawful or unauthorized purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">2. Product Information and Pricing</h2>
            <ul className="list-[lower-alpha] pl-5 space-y-2">
              <li>We strive to provide accurate product descriptions, images, and pricing information. However, we do not guarantee the accuracy or completeness of such information.</li>
              <li>Prices are subject to change without notice. Any promotions or discounts are valid for a limited time and may be subject to additional terms and conditions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">3. Orders and Payments</h2>
            <ul className="list-[lower-alpha] pl-5 space-y-2">
              <li>By placing an order on our website, you are making an offer to purchase the selected products.</li>
              <li>We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraudulent activity.</li>
              <li>You agree to provide valid and up-to-date payment information and authorize us to charge the total order amount, including applicable taxes and shipping fees, to your chosen payment method.</li>
              <li>We use trusted third-party payment processors to handle your payment information securely. We do not store or have access to your full payment details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">4. Shipping and Delivery</h2>
            <ul className="list-[lower-alpha] pl-5 space-y-2">
              <li>We will make reasonable efforts to ensure timely shipping and delivery of your orders.</li>
              <li>Shipping and delivery times provided are estimates and may vary based on your location and other factors.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">5. Returns and Refunds</h2>
            <ul className="list-[lower-alpha] pl-5 space-y-2">
              <li>Our Returns and Refund Policy governs the process and conditions for returning products and seeking refunds. Please refer to the Refund Policy provided on our website for more information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">6. Intellectual Property</h2>
            <ul className="list-[lower-alpha] pl-5 space-y-2">
              <li>All content and materials on our website, including but not limited to text, images, logos, and graphics, are protected by intellectual property rights and are the property of Kandyan Cultural Center or its licensors.</li>
              <li>You may not use, reproduce, distribute, or modify any content from our website without our prior written consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">7. Limitation of Liability</h2>
            <ul className="list-[lower-alpha] pl-5 space-y-2">
              <li>In no event shall Kandyan Cultural Center, its directors, employees, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or the purchase and use of our products.</li>
              <li>We make no warranties or representations, express or implied, regarding the quality, accuracy, or suitability of the products offered on our website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">8. Amendments and Termination</h2>
            <p>
              We reserve the right to modify, update, or terminate these Terms and Conditions at any time without prior notice. It is your responsibility to review these terms periodically for any changes.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}