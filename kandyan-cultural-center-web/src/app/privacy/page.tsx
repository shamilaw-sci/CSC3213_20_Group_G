import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Kandyan Cultural Center',
  description: 'How we collect, use, and protect your data at the Kandyan Cultural Center.',
};

export default function PrivacyPage() {
  const lastUpdated = "May 30, 2026";

  return (
    <main className="min-h-screen bg-stone-50 py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-kandyan-maroon font-bold tracking-widest uppercase text-sm mb-4">Data Protection</h2>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last Updated: {lastUpdated}</p>
        </div>

        {/* Content Document */}
        <div className="bg-white p-8 md:p-14 rounded-[2rem] shadow-sm border border-slate-100 text-slate-600 leading-relaxed space-y-10">
          
          <section>
            <p>
              The Kandyan Cultural Center ("we", "our", or "us") respects your privacy and is committed to protecting the personal data you share with us. This Privacy Policy outlines how we collect, use, safeguard, and disclose your information when you use our website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              We collect information to provide better services to our users. The types of personal data we collect include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Account Information:</strong> Name, email address, phone number, and physical address when you create a profile or make a purchase.</li>
              <li><strong>Booking Information:</strong> Event details, expected invitees, and communication history when requesting the Grand Heritage Hall or booking workshops.</li>
              <li><strong>Payment Information:</strong> We do not store your credit card details on our servers. All transactions are processed securely through certified, third-party payment gateways.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">2. How We Use Your Information</h2>
            <p>Your data allows us to:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Process and deliver your artifact orders globally.</li>
              <li>Review, approve, and manage your facility rental requests.</li>
              <li>Send you order confirmations, e-tickets, and important account updates.</li>
              <li>Improve our website&apos;s user experience and customer service.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">3. Information Sharing</h2>
            <p>
              We strictly <strong>do not sell</strong> your personal information to third parties. We may share necessary data only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Service Providers:</strong> With trusted courier and logistics partners (e.g., DHL, local post) solely for the purpose of delivering your purchased artifacts.</li>
              <li><strong>Legal Requirements:</strong> If required by Sri Lankan law, we may disclose your information to comply with legal proceedings or government requests.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">4. Data Security</h2>
            <p>
              We implement industry-standard security measures, including SSL encryption and secure cloud databases (via Supabase), to protect your personal information from unauthorized access, alteration, or disclosure. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">5. Your Rights</h2>
            <p>
              You have the right to access, update, or request the deletion of your personal data stored on our platform. You can update your profile details directly from your user dashboard. For complete account deletion requests, please contact our administration.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Our Privacy Team</h3>
            <p className="text-sm text-slate-500 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:
            </p>
            <ul className="text-sm font-medium text-slate-700 space-y-1">
              <li><strong>Email:</strong> <a href="mailto:inquiries@kandyanculture.lk" className="text-kandyan-gold hover:underline">inquiries@kandyanculture.lk</a></li>
              <li><strong>Phone:</strong> +94 75 414 7919</li>
              <li><strong>Address:</strong> Kandyan Cultural Center, 72 Sangharaja Mawatha, Kandy, Sri Lanka.</li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}