import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import Button from "@/components/Button";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Ensure fresh catalog data is always fetched

export default async function Home() {
  const { data: featuredArtifacts } = await supabase
    .from('catalog_view')
    .select('*')
    .limit(6);

  return (
    <div className="w-full bg-[#FAFAFA]"> {/* Slightly warmer off-white background */}
      
      {/* 1. HERO SLIDER */}
      <HeroSlider />

      {/* 2. E-COMMERCE TEASER SECTION */}
      <section className="py-24 bg-white relative border-t border-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -mt-20 -mr-20"></div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs md:text-sm flex items-center gap-4 mb-4">
                <span className="w-12 h-px bg-amber-600"></span> Authentic Collection
              </h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                Handcrafted <br className="hidden sm:block"/> 
                <span className="text-rose-800">Masterpieces</span>
              </h3>
            </div>
            
            <div className="shrink-0">
              <Button href="/shop" variant="outline" className="w-full md:w-auto hover:bg-slate-50 transition-colors">
                Discover Full Collection
              </Button>
            </div>
          </div>

          <div className="-mx-4 md:mx-0">
            <FeaturedCarousel artifacts={featuredArtifacts || []} />
          </div>
        </div>
      </section>

      {/* 3. HISTORY & ABOUT SECTION (Modern Narrative Masonry Layout) */}
      <section className="py-24 lg:py-32 bg-stone-50 relative overflow-hidden">
        
        {/* Subtle Watermark/Pattern in the background */}
        <div className="absolute -left-40 top-20 w-96 h-96 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-slate-900">
            <path d="M50 0C50 27.6 27.6 50 0 50C27.6 50 50 72.4 50 100C50 72.4 72.4 50 100 50C72.4 50 50 27.6 50 0Z" />
          </svg>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">

            {/* LEFT: Text Content (Spans 5 columns on Desktop) */}
            <div className="lg:col-span-5 space-y-8 relative z-20 order-1">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-rose-900/10 border border-rose-900/20 text-rose-800 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-rose-800"></span>
                Since 1882
              </div>
              <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs md:text-sm flex items-center gap-4 mb-4">
                <span className="w-12 h-px bg-amber-600"></span> About Us
              </h2>

              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1]">
                Where Tradition <br/> <span className="text-amber-600">Breathes.</span>
              </h3>
              
              <p className="text-slate-600 leading-relaxed text-lg font-light">
                Established to protect and foster the traditional arts of the Kandyan Kingdom, the Kandyan Art Association has been the beating heart of local craftsmanship for over 135 years. 
              </p>
              
              <p className="text-slate-600 leading-relaxed text-lg font-light">
                From intricate brassware to vibrant lacquer work and traditional dumbara weaving, our center ensures that these ancient techniques are passed down, providing master artisans with a global platform and a secure livelihood.
              </p>
              
              <div className="pt-6">
                <Link href="/about" className="group flex items-center gap-4 w-max">
                  <div className="w-14 h-14 rounded-full bg-slate-900 group-hover:bg-amber-600 text-white flex items-center justify-center transition-all duration-300 shadow-lg group-hover:shadow-amber-600/30 group-hover:scale-110">
                    <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                  <span className="text-slate-900 font-bold text-lg group-hover:text-amber-600 transition-colors">
                    Read our full story
                  </span>
                </Link>
              </div>
            </div>

            {/* RIGHT: Narrative Masonry Image Grid (Spans 7 columns on Desktop) */}
            <div className="lg:col-span-7 relative order-2">
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6 items-center relative z-10">
                
                {/* Image 1: Tall Portrait (The Artisan) */}
                <div className="col-span-1 h-[300px] sm:h-[450px] lg:h-[600px] transform lg:translate-y-8 relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/story-master-artisan.jpg" 
                    alt="Master Kandyan Artisan" 
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                </div>

                {/* Images 2 & 3: Stacked Column (The Details & The Craft) */}
                <div className="col-span-1 flex flex-col gap-4 sm:gap-6 transform lg:-translate-y-8">
                  
                  <div className="h-[140px] sm:h-[215px] lg:h-[285px] relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/story-details.jpg" 
                      alt="Intricate carving details" 
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  
                  <div className="h-[140px] sm:h-[215px] lg:h-[285px] relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/story-finished-craft.jpg" 
                      alt="Finished traditional Kandyan craft" 
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                </div>
              </div>

              {/* Floating "Glassmorphism" Stats Card */}
              <div className="absolute -left-4 sm:-left-10 lg:-left-16 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl border border-white p-5 sm:p-6 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] z-30 flex items-center gap-4 sm:gap-5 animate-in slide-in-from-left-8 duration-1000 delay-500 max-w-[200px] sm:max-w-[250px]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">200+</h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1 leading-tight">Master Artisans Supported</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. CORE MODULES TEASER GRID (Interactive Glass Cards) */}
      <section className="py-24 lg:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Digital Services</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">Access the Kandy Cultural Center from anywhere in the world through our modern, integrated portal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            
            {/* E-Commerce Card */}
            <Link href="/shop" className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-3xl p-10 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-slate-900 border border-slate-700 text-amber-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors duration-500 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Global Shop</h3>
              <p className="text-slate-400 mb-8 font-light leading-relaxed group-hover:text-slate-300 transition-colors">
                Purchase authentic artifacts directly from local artisans with international shipping and secure checkout.
              </p>
              <div className="text-amber-500 font-bold flex items-center gap-2 group-hover:gap-4 transition-all text-sm uppercase tracking-wider">
                Browse Catalog <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </div>
            </Link>

            {/* Booking Card */}
            <Link href="/workshops" className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 rounded-3xl p-10 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-slate-900 border border-slate-700 text-rose-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-500 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Workshops & Shows</h3>
              <p className="text-slate-400 mb-8 font-light leading-relaxed group-hover:text-slate-300 transition-colors">
                Reserve your seats for daily cultural shows or enroll in exclusive, hands-on masterclasses.
              </p>
              <div className="text-rose-500 font-bold flex items-center gap-2 group-hover:gap-4 transition-all text-sm uppercase tracking-wider">
                View Schedule <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </div>
            </Link>

            {/* Facility Card */}
            <Link href="/facilities" className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-3xl p-10 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-slate-900 border border-slate-700 text-emerald-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-colors duration-500 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Facility Rental</h3>
              <p className="text-slate-400 mb-8 font-light leading-relaxed group-hover:text-slate-300 transition-colors">
                Book our historic halls and open-air spaces for private events through our real-time calendar.
              </p>
              <div className="text-emerald-500 font-bold flex items-center gap-2 group-hover:gap-4 transition-all text-sm uppercase tracking-wider">
                Check Availability <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </div>
            </Link>

          </div>
        </div>
      </section>

{/* 5. CONTACT & LOCATION SECTION (Premium Map-Focused Layout) */}
      <section id="contact" className="py-24 lg:py-32 bg-white relative overflow-hidden border-t border-slate-100">
        
        {/* Soft Background Orbs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-rose-50/40 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-50/40 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
            
            {/* Left: Contact Information */}
            <div className="w-full lg:w-5/12 bg-slate-950 p-10 lg:p-16 text-white flex flex-col justify-center relative overflow-hidden">
              {/* Subtle background texture */}
              <div className="absolute inset-0 bg-[url('/story1.png')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/90"></div>
              
              <div className="relative z-10">
                <h2 className="text-amber-500 font-bold tracking-widest uppercase text-xs mb-4 flex items-center gap-3">
                  <span className="w-8 h-px bg-amber-500"></span> Plan Your Visit
                </h2>
                <h3 className="text-3xl lg:text-5xl font-black leading-tight mb-6">
                  Experience the <br/> Heritage.
                </h3>
                <p className="text-slate-400 font-light mb-12 text-lg">
                  Immerse yourself in authentic Kandyan artistry. Our doors are open for artifact viewings, cultural shows, and facility tours.
                </p>
                
                <div className="space-y-8">
                  {/* Address */}
                  <div className="flex items-start gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 border border-white/10 group-hover:border-amber-500/30 transition-all shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 text-lg">Location</h4>
                      <p className="text-slate-400 font-light">Kandyan Cultural Center, <br/> 72 Sangharaja Mawatha, Kandy</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 border border-white/10 group-hover:border-amber-500/30 transition-all shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 text-lg">Call Us</h4>
                      <p className="text-slate-400 font-light">+94 81 222 3100</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 border border-white/10 group-hover:border-amber-500/30 transition-all shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 text-lg">Opening Hours</h4>
                      <p className="text-slate-400 font-light">Mon - Sun: 9:00 AM - 5:00 PM <br/> <span className="text-xs text-amber-500/80 uppercase tracking-wider font-bold">Closed on Poya Days</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <a 
                    href="https://maps.app.goo.gl/tx8bBv6te3HQEoWeA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] transform hover:-translate-y-1"
                  >
                    Get Directions
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Full Height Map */}
            <div className="w-full lg:w-7/12 relative h-[400px] lg:h-auto min-h-[400px] bg-slate-100">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.553936491901!2d80.64227848058623!3d7.291482866892161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3662e0b35b093%3A0xc76f67dd109772a7!2sKandyan%20Cultural%20Centre!5e0!3m2!1sen!2slk!4v1780079205725!5m2!1sen!2slk"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Kandy Cultural Center Location"
              ></iframe>

              {/* Floating Glassmorphism Map Card */}
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-[320px] bg-white/90 backdrop-blur-xl border border-white p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] z-20 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Central Location</h5>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Overlooking Kandy Lake</p>
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}