import Link from "next/link";
import Button from "@/components/Button";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import InteractiveBackground from "@/components/InteractiveBackground";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; 

export default async function Home() {
  const { data: featuredArtifacts } = await supabase
    .from('catalog_view')
    .select('*')
    .limit(6);

  return (
    <div className="relative w-full">
      {/* The interactive fixed background handles the Mask and Glass Letters */}
      <InteractiveBackground />

      {/* Main Content Wrapper - Relative z-10 puts it above the background */}
      <main className="relative z-10 w-full">
        
        {/* hero */}
        <section className="min-h-screen flex flex-col justify-center items-center px-4 md:px-12 top-0 bg-white/10">
          <div className="glass-panel p-8 md:p-16 rounded-[3rem] max-w-4xl w-full text-center mt-20">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
              Est. 1882
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Preserving Heritage. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">
                Embracing the Future.
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto font-light">
              Experience the authentic artistry of Sri Lanka. Book cultural shows, rent historic facilities, and support local craftsmen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/shop" className="bg-amber-600 hover:bg-amber-500 text-white shadow-[0_8px_20px_rgba(217,119,6,0.3)]">
                Explore Crafts Shop
              </Button>
              <Button href="/workshops" className=" bg-white/50 backdrop-blur-md border border-white/80 rounded-xl hover:border-amber-400 hover:bg-white/80 text-slate-700! hover:text-amber-600!">
                Book Workshops
              </Button>
            </div>
          </div>
        </section>

        {/* about */}
        <section className="min-h-screen flex items-center px-4 py-24 top-0 bg-white/30 backdrop-blur-lg border-t border-white/60">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Side */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="glass-panel p-8 sm:p-12 md:p-14 rounded-[3rem]">
                  <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center gap-4">
                    <span className="w-12 h-px bg-amber-600"></span> About Us
                  </h2>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6">
                    Where Tradition <br/> <span className="text-amber-600">Breathes.</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg font-light mb-6">
                    Established to protect and foster the traditional arts of the Kandyan Kingdom, we have been the beating heart of local craftsmanship for over 135 years. From intricate brassware to vibrant lacquer work, we ensure ancient techniques are passed down.
                  </p>
                  <Link href="/about" className="font-bold text-amber-600 flex items-center gap-2 hover:gap-4 transition-all w-max">
                    Read our full story <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </Link>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                   <div className="glass-panel p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
                      <h4 className="text-3xl sm:text-4xl font-black text-amber-600 mb-2">200+</h4>
                      <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest">Master Artisans</p>
                   </div>
                   <div className="glass-panel p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
                      <h4 className="text-3xl sm:text-4xl font-black text-rose-600 mb-2">135</h4>
                      <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest">Years of Legacy</p>
                   </div>
                </div>
              </div>

              {/* Right Side photo */}
              <div className="lg:col-span-5 h-full min-h-[400px] lg:min-h-[500px] relative">
                <div className="glass-panel w-full h-full rounded-[3rem] p-3 relative overflow-hidden flex items-center justify-center group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/story-master-artisan.png"
                    alt="Master Kandyan Artisan at Work" 
                    className="w-full h-full object-cover rounded-[2.2rem] shadow-inner opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 rounded-[2.2rem] shadow-[inset_0_0_40px_rgba(255,255,255,0.4)] pointer-events-none"></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* e-commerce */}
        <section className="min-h-screen flex flex-col justify-center px-4 py-24 top-0 bg-[#F8F9FA]/80 backdrop-blur-xl border-t border-white/60">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center gap-4">
                  <span className="w-12 h-px bg-amber-600"></span> Authentic Collection
                </h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                  Handcrafted <span className="text-rose-700">Masterpieces</span>
                </h3>
              </div>
            </div>
            
            <div className="-mx-4 md:mx-0">
              <FeaturedCarousel artifacts={featuredArtifacts || []} />
            </div>
          </div>
        </section>


        <section className="min-h-screen flex flex-col justify-center py-24 top-0 bg-white/40 backdrop-blur-lg border-t border-white/60 relative overflow-hidden">

          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-4">
                <span className="w-12 h-px bg-amber-600"></span> Online Portal <span className="w-12 h-px bg-amber-600"></span>
              </h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Digital Services</h3>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light">Access the Kandyan Cultural Center from anywhere in the world through our modern, integrated platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* E-Commerce Card */}
              <Link href="/shop" className="glass-panel group rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(31,38,135,0.1)] relative overflow-hidden">
                <div className="w-16 h-16 bg-amber-100 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-500 shadow-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Global Shop</h3>
                <p className="text-slate-600 mb-8 font-light leading-relaxed">
                  Purchase authentic artifacts directly from local artisans with international shipping and secure checkout.
                </p>
                <div className="text-amber-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all text-sm uppercase tracking-wider">
                  Browse Catalog <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </Link>

              {/* Booking Card */}
              <Link href="/workshops" className="glass-panel group rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(31,38,135,0.1)] relative overflow-hidden">
                <div className="w-16 h-16 bg-rose-100 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-500 shadow-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Shows & Workshops</h3>
                <p className="text-slate-600 mb-8 font-light leading-relaxed">
                  Reserve your seats for daily cultural shows or enroll in exclusive, hands-on crafting masterclasses.
                </p>
                <div className="text-rose-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all text-sm uppercase tracking-wider">
                  View Schedule <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </Link>

              {/* Facility Card */}
              <Link href="/facilities" className="glass-panel group rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(31,38,135,0.1)] relative overflow-hidden">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500 shadow-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Facility Rental</h3>
                <p className="text-slate-600 mb-8 font-light leading-relaxed">
                  Book our historic halls and open-air spaces for private events through our real-time calendar system.
                </p>
                <div className="text-emerald-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all text-sm uppercase tracking-wider">
                  Check Availability <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="min-h-screen flex items-center justify-center py-24 top-0 bg-[#F8F9FA]/80 backdrop-blur-2xl border-t border-white/60 relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="glass-panel rounded-[3rem] overflow-hidden flex flex-col lg:flex-row min-h-[600px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-white">
              
              {/* Left: Contact Info */}
              <div className="w-full lg:w-5/12 bg-white/40 p-10 lg:p-14 flex flex-col justify-center relative border-r border-white/60">
                <div className="relative z-10">
                  <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center gap-3">
                    <span className="w-8 h-px bg-amber-600"></span> Plan Your Visit
                  </h2>
                  <h3 className="text-3xl lg:text-5xl font-black text-slate-900 leading-tight mb-6">
                    Experience the <br/> Heritage.
                  </h3>
                  <p className="text-slate-600 font-light mb-12 text-lg">
                    Immerse yourself in authentic Kandyan artistry. Our doors are open for artifact viewings, cultural shows, and facility tours.
                  </p>
                  
                  <div className="space-y-8">
                    {/* Address */}
                    <div className="flex items-start gap-5 group">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-white shadow-sm group-hover:border-amber-400 group-hover:bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 text-lg">Location</h4>
                        <p className="text-slate-600 font-light">Kandyan Cultural Center, <br/> 72 Sangharaja Mawatha, Kandy</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-5 group">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-white shadow-sm group-hover:border-amber-400 group-hover:bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 text-lg">Call Us</h4>
                        <p className="text-slate-600 font-light">+94 81 222 3100</p>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-5 group">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-white shadow-sm group-hover:border-amber-400 group-hover:bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 text-lg">Opening Hours</h4>
                        <p className="text-slate-600 font-light">Mon - Sat: 9:00 AM - 5:00 PM <br/> <span className="text-xs text-amber-600 uppercase tracking-wider font-bold">Closed on Poya Days</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    <a 
                      href="https://maps.app.goo.gl/tx8bBv6te3HQEoWeA" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1"
                    >
                      Get Directions
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right: Map Area */}
              <div className="w-full lg:w-7/12 relative h-[400px] lg:h-auto min-h-[400px] bg-white p-2 sm:p-4">
                <div className="w-full h-full rounded-[2rem] overflow-hidden relative border border-slate-100">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.553936491901!2d80.64227848058623!3d7.291482866892161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3662e0b35b093%3A0xc76f67dd109772a7!2sKandyan%20Cultural%20Centre!5e0!3m2!1sen!2slk!4v1780079205725!5m2!1sen!2slk"
                    className="absolute inset-0 w-full h-full object-cover grayscale-[30%] contrast-[1.1] opacity-90"
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Kandy Cultural Center Location"
                  ></iframe>

                  {/* Floating Glass Map */}
                  <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-[320px] bg-white/80 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] z-20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
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
          </div>
        </section>

      </main>
    </div>
  );
}