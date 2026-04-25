import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import Button from "@/components/Button";

export default function Home() {
  return (
    <div className="w-full bg-kandyan-bg">
      {/* 1. NEW DYNAMIC HERO SLIDER */}
      <HeroSlider />

      {/* 2. HISTORY & ABOUT SECTION (Modern Overlap Layout) */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <div className="space-y-8 pr-0 lg:pr-8">
              <h2 className="text-kandyan-maroon font-bold tracking-widest uppercase text-sm flex items-center gap-4">
                <span className="w-12 h-px bg-kandyan-maroon"></span> Our Legacy
              </h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                A Century of <br/> <span className="text-kandyan-gold">Kandyan Artistry</span>
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Established to protect and foster the traditional arts and crafts of the Kandyan Kingdom, the Kandyan Art Association has been the beating heart of local craftsmanship for generations. 
              </p>
              <p className="text-slate-600 leading-relaxed text-lg">
                From intricate brassware to vibrant lacquer work and traditional dumbara weaving, our center ensures that these ancient techniques are passed down, providing artisans with a global platform.
              </p>
              <Button href="/about" variant="ghost" className="mt-4 font-bold group">
                Read the full history 
                <span className="group-hover:translate-x-2 transition-transform inline-block ml-2">→</span>
              </Button>
            </div>

            {/* Modern Image Grid */}
            <div className="relative h-[500px] lg:h-[600px] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/story2.png" 
                alt="Kandyan Craftsmanship" 
                className="absolute top-0 right-0 w-3/4 h-[70%] object-cover rounded-3xl shadow-2xl z-10"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="story1.png" 
                alt="Kandy City Cultural Heritage" 
                className="absolute bottom-0 left-0 w-2/3 h-[60%] object-cover rounded-3xl shadow-2xl border-8 border-white z-20"
              />
              {/* Decorative Accent */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl z-0"></div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CORE MODULES TEASER GRID (Hover-focused Cards) */}
      <section className="py-24 bg-kandyan-bg">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Digital Services</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Access the Kandy Cultural Center from anywhere in the world through our modern, integrated portal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* E-Commerce Card */}
            <div className="bg-white rounded-3xl p-10 shadow-kandyan-soft hover:shadow-kandyan-hover border border-slate-100 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-amber-50 text-kandyan-gold rounded-2xl flex items-center justify-center mb-8 group-hover:bg-kandyan-gold group-hover:text-white transition-colors duration-300 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Global Shop</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Purchase authentic artifacts directly from local artisans with international ship-to-home capabilities and a secure checkout.
              </p>
              <Button href="/shop" variant="ghost" className="text-kandyan-gold font-bold flex items-center group-hover:gap-3 transition-all px-0 py-0 hover:translate-x-0">
                Browse Catalog <span className="text-xl ml-2">→</span>
              </Button>
            </div>

            {/* Booking Card */}
            <div className="bg-white rounded-3xl p-10 shadow-kandyan-soft hover:shadow-kandyan-hover border border-slate-100 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-rose-50 text-kandyan-maroon rounded-2xl flex items-center justify-center mb-8 group-hover:bg-kandyan-maroon group-hover:text-white transition-colors duration-300 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Workshops & Shows</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Reserve your seats for daily cultural shows or enroll in exclusive, hands-on masterclasses with veteran craftsmen.
              </p>
              <Button href="/workshops" variant="ghost" className="text-kandyan-maroon font-bold flex items-center group-hover:gap-3 transition-all px-0 py-0 hover:translate-x-0">
                View Schedule <span className="text-xl ml-2">→</span>
              </Button>
            </div>

            {/* Facility Card */}
            <div className="bg-white rounded-3xl p-10 shadow-kandyan-soft hover:shadow-kandyan-hover border border-slate-100 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Facility Rental</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Book our historic halls and open-air spaces for private events or corporate functions through our real-time calendar.
              </p>
              <Button href="/facilities" variant="ghost" className="text-slate-800 font-bold flex items-center group-hover:gap-3 transition-all px-0 py-0 hover:translate-x-0">
                Check Availability <span className="text-xl ml-2">→</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONTACT US SECTION (Clean Light Theme with Map) */}
      <section id="contact" className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
        {/* Soft Decorative Background Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-50/50 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-50/50 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Contact Information & Map */}
            <div className="space-y-8">
              <div>
                <h2 className="text-kandyan-gold font-bold tracking-widest uppercase text-sm flex items-center gap-4 mb-4">
                  <span className="w-12 h-px bg-kandyan-gold"></span> Get in Touch
                </h2>
                <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                  Connect with our <br/> <span className="text-kandyan-maroon">Heritage Center</span>
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg max-w-md">
                  Whether you want to inquire about custom artifact commissions, book a private workshop, or rent our historic halls, our team is here to assist you.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Address Block */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-kandyan-gold flex-shrink-0 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold mb-1">Visit Us</h4>
                    <p className="text-slate-600 text-sm">Kandy Cultural Center, <br/> Sangharaja Mawatha, Kandy</p>
                  </div>
                </div>

                {/* Phone Block (NEW) */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-kandyan-gold flex-shrink-0 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold mb-1">Call Us</h4>
                    <p className="text-slate-600 text-sm">+94 75 414 7919 <br/> Mon-Sun, 9am to 6pm</p>
                  </div>
                </div>

                {/* Email Block */}
                <div className="flex items-start gap-4 sm:col-span-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-kandyan-gold flex-shrink-0 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold mb-1">Email Us</h4>
                    <p className="text-slate-600 text-sm">inquiries@kandyanculture.lk</p>
                  </div>
                </div>
              </div>

              {/* Google Map Embedded (NEW) */}
              <div className="mt-8 w-full h-64 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d853.6073594158014!2d80.6418359627238!3d7.291895411662758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3662e0b35b093%3A0xc76f67dd109772a7!2sKandyan%20Cultural%20Centre!5e0!3m2!1sen!2slk!4v1775937943809!5m2!1sen!2slk"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kandy Cultural Center Location"
                ></iframe>
              </div>
            </div>

            {/* Right: Contact Form (Light Clean Card) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-kandyan-hover h-full flex flex-col justify-center">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">First Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-colors placeholder:text-slate-400 shadow-sm" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Last Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-colors placeholder:text-slate-400 shadow-sm" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-colors placeholder:text-slate-400 shadow-sm" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Message</label>
                  <textarea rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-colors resize-none placeholder:text-slate-400 shadow-sm" placeholder="How can we help you?"></textarea>
                </div>

                <Button variant="accent" type="button" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}