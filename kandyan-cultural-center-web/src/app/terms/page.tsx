import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | Kandyan Cultural Center',
  description: 'Terms of service and conditions for using the Kandyan Cultural Center platform.',
};

export default function TermsPage() {
  const lastUpdated = "May 30, 2026";

  return (
    <main className="min-h-screen bg-stone-50 py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-kandyan-gold font-bold tracking-widest uppercase text-sm mb-4">Legal Framework</h2>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Terms & Conditions</h1>
          <p className="text-slate-500 font-medium">Last Updated: {lastUpdated}</p>
        </div>

        {/* Content Document */}
        <div className="bg-white p-8 md:p-14 rounded-[2rem] shadow-sm border border-slate-100 text-slate-600 leading-relaxed space-y-10">
          
          <section>
            <p>
              Welcome to the Kandyan Cultural Center (KCC) and the Kandyan Art Association platform. By accessing our website, purchasing artifacts, or booking our facilities, you agree to comply with and be bound by the following Terms and Conditions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">1. Global Artifact Shop</h2>
            <p>
              <strong>1.1 Authenticity:</strong> All artifacts sold on our platform are guaranteed to be authentic, handcrafted items made by registered artisans of the Kandyan Art Association. Due to the handmade nature of these items, slight variations in color, weight, and dimensions may occur compared to the images displayed.
            </p>
            <p>
              <strong>1.2 Pricing & Customs:</strong> All prices are listed in Sri Lankan Rupees (LKR). For international orders, customers are solely responsible for any import duties, customs taxes, or local levies imposed by their respective countries upon delivery.
            </p>
            <p>
              <strong>1.3 Returns & Refunds:</strong> Due to the delicate and traditional nature of our crafts, returns are only accepted if the item arrives damaged. You must notify us at <a href="mailto:inquiries@kandyanculture.lk" className="text-kandyan-gold font-bold hover:underline">inquiries@kandyanculture.lk</a> within 48 hours of delivery with photographic evidence.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">2. Grand Heritage Hall Bookings</h2>
            <p>
              <strong>2.1 Availability:</strong> The hall is available for booking on any day, including public holidays and Poya days, subject to prior reservations. Time slots are strictly limited from morning until 2:00 PM unless explicitly agreed upon in writing by the KCC administration.
            </p>
            <p>
              <strong>2.2 Facilities & Equipment:</strong> The KCC provides seating, basic stage setup, and washroom facilities. Renters are responsible for providing their own sound systems, projectors, and any specialized lighting.
            </p>
            <p>
              <strong>2.3 Damages:</strong> The renter assumes full financial responsibility for any damages caused to the hall, its architecture, or its included furniture during the reserved time slot.
            </p>
            <p>
              <strong>2.4 Approvals:</strong> Submitting a booking request via our platform does not guarantee a reservation. Bookings are only finalized upon administrative review, approval, and receipt of the required advance payment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">3. Workshops & Cultural Shows</h2>
            <p>
              <strong>3.1 Tickets:</strong> E-tickets generated for cultural shows and workshops are non-transferable.
            </p>
            <p>
              <strong>3.2 Cancellations:</strong> The KCC reserves the right to cancel or reschedule workshops due to artisan unavailability or unforeseen circumstances. In such events, a full refund or an alternative date will be provided.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">4. Intellectual Property</h2>
            <p>
              All content on this website, including photographs of artifacts, historical texts, artisan biographies, and logos, are the exclusive property of the Kandyan Art Association. Reproduction, distribution, or commercial use of these materials without written consent is strictly prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">5. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the Democratic Socialist Republic of Sri Lanka. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Kandy, Sri Lanka.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section>
            <p className="text-sm text-slate-500">
              If you have any questions regarding these Terms & Conditions, please contact us at <a href="mailto:inquiries@kandyanculture.lk" className="text-kandyan-maroon font-bold hover:underline">inquiries@kandyanculture.lk</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}