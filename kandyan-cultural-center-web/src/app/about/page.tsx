import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Our History | Kandyan Cultural Center',
  description: 'The rich heritage and history of the Kandyan Art Association.',
};

export default function AboutPage() {
  return (
    <main className="relative w-full bg-[#F8F9FA]">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft animated gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        
        {/* Subtle Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- MAIN SCROLLING CONTENT --- */}
      <div className="relative z-10 w-full pb-24">
        
        {/* 1. HERO SECTION */}
        <section className="flex flex-col justify-center items-center px-4 md:px-12 pt-32 pb-16 top-0">
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] max-w-4xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-400/20 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-4">
                <span className="w-12 h-px bg-amber-600"></span> Since 1882 <span className="w-12 h-px bg-amber-600"></span>
              </h2>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                Preserving the Soul of <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">Kandyan Heritage</span>
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                Set among the hills, Kandy, the ancient capital, is unrivaled in its sylvan beauty. But its greatest possession is a culture entirely Kandyan in character, surviving the vicissitudes of time.
              </p>
            </div>
          </div>
        </section>

        {/* 2. THE GOLDEN ERA */}
        <section className="min-h-screen flex items-center px-4 py-24 top-0 bg-white/20 backdrop-blur-md border-t border-white/50">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              <div className="relative h-[400px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] group bg-white/50 p-2 border border-white/60">
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                  <Image src="/ancient-craftsmen.png" alt="Ancient Craftsmen" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] pointer-events-none"></div>
                </div>
              </div>
              
              <div className="bg-white/50 backdrop-blur-xl border border-white/80 p-10 md:p-14 rounded-[3rem] shadow-[0_20px_40px_rgba(31,38,135,0.05)]">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 mb-6 border border-amber-200/50 shadow-sm">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">The Golden Era of Royal Guilds</h2>
                <p className="text-slate-600 leading-relaxed text-lg font-light mb-6">
                  During the time of the Sinhala kings, the artificer, the dancer, the weaver, and the wood carver were held in very high esteem. Art was an organized trade, with workmen formed into highly exclusive, hereditary guilds. 
                </p>
                <blockquote className="border-l-4 border-amber-500 pl-6 py-4 my-8 bg-white/60 rounded-r-2xl pr-4 shadow-sm">
                  <p className="text-slate-700 italic font-medium leading-relaxed">
                    "No artificers ever changed their trade from generation to generation; but the son is the same as was his father and the daughter marries only to those of the same craft." <br/>
                    <span className="text-sm font-bold text-amber-600 mt-3 block">— Robert Knox </span>
                  </p>
                </blockquote>
                <p className="text-slate-600 leading-relaxed text-lg font-light">
                  The most skilled craftsmen were employed permanently in the royal household, holding land from the King and receiving special gifts, such as cattle, for work well done, rather than a daily wage.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 3. THE DECLINE & THE RENAISSANCE */}
        <section className="min-h-screen flex items-center px-4 py-24 top-0 bg-[#F8F9FA]/80 backdrop-blur-lg border-t border-white/60">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              <div className="order-2 lg:order-1 bg-white/60 backdrop-blur-xl border border-white/80 p-10 md:p-14 rounded-[3rem] shadow-[0_20px_40px_rgba(31,38,135,0.05)]">
                <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">The Decline & <br/>The Renaissance</h2>
                <p className="text-slate-600 leading-relaxed text-lg font-light mb-6">
                  With the British conquest, the corporations of artificers lost their compact nature. The new masters had no care for the traditions of an art they could not understand, and the introduction of Western patterns degraded Eastern art. By the late 19th century, only a few individual workers remained, hidden in the Kandyan provinces.
                </p>
                <p className="text-slate-600 leading-relaxed text-lg font-light mb-8">
                  Witnessing this destruction—where beautiful 17th and 18th-century architecture was decaying or being ruined by incompetent, rainbow-colored restorations—scholars like Ananda Coomaraswamy pleaded with Kandyan Chiefs to preserve these priceless historical documents.
                </p>
                
                {/* Highlight Glass Box */}
                <div className="bg-amber-50/80 backdrop-blur-sm p-8 rounded-[2rem] border border-amber-200/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <h4 className="font-extrabold text-slate-900 mb-3 text-lg">The Birth of the Association (1882)</h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    To revive these dying crafts, the Kandyan Art Association was formally organized in 1882 by Sir J.F. Dickson, Government Agent of the Central Province. Initially, it was a society where subscribers paid to employ the best workmen, distributing the pure Kandyan articles by lot.
                  </p>
                </div>
              </div>

              <div className="order-1 lg:order-2 relative h-[400px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white/50 p-2 border border-white/60 group">
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                  <Image src="/colonial-era.png" alt="Colonial Era Kandy" fill className="object-cover sepia-[0.3] group-hover:sepia-0 transition-all duration-1000" />
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] pointer-events-none"></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. OUR HISTORIC HOME TIMELINE */}
        <section className="min-h-screen flex flex-col justify-center px-4 py-24 top-0 bg-white/40 backdrop-blur-2xl border-t border-white/60">
          <div className="container mx-auto max-w-6xl relative z-10">
            
            {/* Header */}
            <div className="text-center mb-24 flex justify-center">
              <div className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-white/80 shadow-[0_20px_50px_rgba(31,38,135,0.05)] w-full max-w-3xl">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight">A Century of Safe Havens</h2>
                <p className="text-slate-600 text-lg md:text-xl font-light">Tracing the physical roots of our association.</p>
              </div>
            </div>

            <div className="relative w-full max-w-5xl mx-auto">
              
              {/* Glowing Central Timeline Line */}
              <div className="absolute left-[2.25rem] md:left-1/2 top-4 bottom-4 w-1.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-400 to-transparent rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] z-0"></div>

              <div className="space-y-12 md:space-y-24">
                
                {/* Timeline Item 1 */}
                <div className="relative flex flex-col md:flex-row items-end md:items-center md:justify-between w-full group/timeline">
                  
                  {/* Central Node */}
                  <div className="absolute left-[2.25rem] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full border-[6px] border-white bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xl z-10 transition-transform duration-500 group-hover/timeline:scale-125 group-hover/timeline:shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                    <span className="text-sm font-black tracking-wider">1882</span>
                  </div>

                  {/* Desktop Spacer (Hidden on Mobile) */}
                  <div className="hidden md:block w-[calc(50%-4rem)]"></div>

                  {/* Card (Right side on desktop) */}
                  <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_15px_40px_rgba(31,38,135,0.05)] border border-white/80 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(217,119,6,0.15)] hover:border-amber-300 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute -right-4 -top-8 text-[10rem] text-slate-900/[0.03] font-black pointer-events-none select-none">1</div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 relative z-10">The Kandy Kachcheri</h3>
                    <p className="text-base text-slate-600 leading-relaxed font-light relative z-10">Work was centered at the Kandy Kachcheri and a room under the United Services Library.</p>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative flex flex-col md:flex-row-reverse items-end md:items-center md:justify-between w-full group/timeline">
                  
                  {/* Central Node */}
                  <div className="absolute left-[2.25rem] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full border-[6px] border-white bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-xl z-10 transition-transform duration-500 group-hover/timeline:scale-125 group-hover/timeline:shadow-[0_0_30px_rgba(225,29,72,0.6)]">
                    <span className="text-sm font-black tracking-wider">1904</span>
                  </div>

                  {/* Desktop Spacer (Hidden on Mobile) */}
                  <div className="hidden md:block w-[calc(50%-4rem)]"></div>

                  {/* Card (Left side on desktop) */}
                  <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_15px_40px_rgba(31,38,135,0.05)] border border-white/80 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(225,29,72,0.15)] hover:border-rose-300 transition-all duration-500 relative overflow-hidden md:text-right flex flex-col md:items-end">
                    <div className="absolute -left-4 md:left-auto md:-right-4 -top-8 text-[10rem] text-slate-900/[0.03] font-black pointer-events-none select-none">2</div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 relative z-10">Palle Vahala</h3>
                    <p className="text-base text-slate-600 leading-relaxed font-light relative z-10">Moved to an 18th-century Kandyan building, reported to be the former quarters of the ladies of the Royal Household.</p>
                  </div>
                </div>

                {/* Timeline Item 3 (Highlight) */}
                <div className="relative flex flex-col md:flex-row items-end md:items-center md:justify-between w-full group/timeline">
                  
                  {/* Central Node */}
                  <div className="absolute left-[2.25rem] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 rounded-full border-[6px] border-white bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-[0_0_25px_rgba(245,158,11,0.5)] z-10 transition-transform duration-500 group-hover/timeline:scale-110 group-hover/timeline:shadow-[0_0_40px_rgba(245,158,11,0.8)]">
                    <span className="text-base font-black tracking-wider">1924</span>
                  </div>

                  {/* Desktop Spacer (Hidden on Mobile) */}
                  <div className="hidden md:block w-[calc(50%-4rem)]"></div>

                  {/* Card (Right side on desktop)*/}
                  <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] bg-white/90 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_25px_50px_rgba(217,119,6,0.1)] border border-amber-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(217,119,6,0.2)] hover:border-amber-400 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 blur-[50px] rounded-full pointer-events-none"></div>
                    <div className="absolute -right-4 -top-8 text-[10rem] text-amber-900/[0.04] font-black pointer-events-none select-none">3</div>
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-4 relative z-10 border border-amber-200/50">Current Home</div>
                    <h3 className="text-3xl font-black text-amber-600 mb-3 relative z-10">72, Sangharaja Mawatha</h3>
                    <p className="text-base text-slate-700 leading-relaxed font-medium relative z-10">Incorporated as a Trust in 1919, the association moved to its permanent home in 1924. This building was used as a military hospital during British administration.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 5. THE GRAND HERITAGE HALL & ARCHITECTURE */}
        <section className="min-h-screen flex items-center px-4 py-24 top-0 bg-[#F8F9FA]/90 backdrop-blur-lg border-t border-white/60">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-10 md:p-14 rounded-[3rem] shadow-[0_20px_40px_rgba(31,38,135,0.05)]">
                <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">The Centenary Expansion</h2>
                <p className="text-slate-600 leading-relaxed text-lg font-light mb-6">
                  Under the vision of A.B. Damunupola (Gov. Agent 1977-1986), the association underwent a massive expansion. To mark its official centenary, the 1000-seat Kandyan Cultural Centre was opened in 1984 by H.E. President J.R. Jayewardene.
                </p>
                <p className="text-slate-600 leading-relaxed text-lg font-light">
                  Architect Minnette de Silva designed the complex to reflect true Kandyan philosophy. The 'Nrutiya Mandapa' (auditorium) features a 'Kamatha' (threshing floor) style stage integrated into the natural landscape. Eschewing modern glass and concrete, the design relies heavily on traditional flat Kandyan roofing tiles, perfectly harmonizing with the Cultural Triangle.
                </p>
              </div>

              <div className="relative h-[400px] lg:h-[550px] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white/50 p-2 border border-white/60 group">
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                  <Image src="/hall-wide.png" alt="Kandyan Architecture" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6. EMPOWERING THE ARTISANS */}
        <section className="min-h-screen flex flex-col justify-center px-4 py-24 top-0 bg-white/30 backdrop-blur-xl border-t border-white/60">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16 max-w-3xl mx-auto bg-white/50 backdrop-blur-md p-10 rounded-[3rem] border border-white/80 shadow-sm">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Empowering Today's Master Craftsmen</h2>
              <p className="text-slate-600 text-lg font-light">
                Today, our membership comprises over 200 craftsmen from traditional Kandyan families. We no longer just preserve art; we protect the artists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80 hover:-translate-y-2 transition-all group">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <span className="text-2xl font-black">%</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">EPF & Welfare Fund</h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed">A massive 15% of sales (9% from the association, 6% from the member) is deposited directly into a protective welfare fund.</p>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80 hover:-translate-y-2 transition-all group">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-200 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Retirement Pensions</h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed">Initiated in 2017 by H.M.P. Hitisekera, craftsmen over the age of 60 receive a dedicated retirement pension.</p>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80 hover:-translate-y-2 transition-all group">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-200 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Healthcare & Grants</h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed">We provide financial assistance for eyeglasses and a Rs. 5000 donation to families in the event of a member's passing.</p>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80 hover:-translate-y-2 transition-all group">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rose-200 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Fair Trade Markets</h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed">We act as the medium between the purchaser and producer, guaranteeing authentic wares while ensuring highly remunerative markets for artisans.</p>
              </div>

            </div>
          </div>
        </section>

        {/* 7. VISIT US CTA */}
        <section className="min-h-[60vh] flex flex-col justify-center px-4 py-24 top-0 bg-white/60 backdrop-blur-2xl border-t border-white/80 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Experience the Legacy</h2>
            <p className="text-slate-600 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed">
              The affairs of the Trust are securely managed by a Committee of Management, presided over by the Government Agent of the Kandy District. We invite you to witness our veteran craftsmen at work.
            </p>
            <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 inline-block px-8 py-4 rounded-2xl mb-12 shadow-sm">
              <p className="text-slate-600 text-sm font-bold tracking-widest uppercase">
                Open Monday to Saturday: 9:00 AM - 5:00 PM <br/> 
                <span className="text-xs font-medium lowercase text-slate-500 mt-1 block">(Closed on Poya & Public Holidays)</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/shop" className="bg-amber-600 hover:bg-amber-500 text-white px-10 py-4 rounded-2xl font-bold transition-all w-full sm:w-auto shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1 text-lg">
                Shop the Collection
              </Link>
              <Link href="/facilities" className="bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-amber-400 px-10 py-4 rounded-2xl font-bold transition-all w-full sm:w-auto shadow-sm transform hover:-translate-y-1 text-lg">
                Book the Heritage Hall
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}