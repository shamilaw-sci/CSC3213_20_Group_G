import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Our History | Kandyan Cultural Center',
  description: 'The rich heritage and history of the Kandyan Art Association.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      
      {/* 1. HERO SECTION */}
      <section className="bg-slate-950 py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <Image src="/about/kandy-heritage.jpg" alt="Ancient Kandy" fill className="object-cover" priority />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-kandyan-maroon/30 rounded-full blur-[120px]"></div>
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
          <h2 className="text-kandyan-gold font-bold tracking-widest uppercase text-sm mb-6 flex items-center justify-center gap-4">
            <span className="w-12 h-px bg-kandyan-gold"></span> 
            Since 1882
            <span className="w-12 h-px bg-kandyan-gold"></span>
          </h2>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8">
            Preserving the Soul of <br/><span className="text-kandyan-maroon">Kandyan Heritage</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed">
            Set among the hills, Kandy, the ancient capital, is unrivaled in its sylvan beauty. But its greatest possession is a culture entirely Kandyan in character, surviving the vicissitudes of time.
          </p>
        </div>
      </section>

      {/* 2. THE GOLDEN ERA (Royal Patronage) */}
      <section className="py-20 lg:py-32 container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[400px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl group">
            <Image src="/about/ancient-craftsmen.jpg" alt="Ancient Craftsmen" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2.5rem]"></div>
          </div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-kandyan-gold mb-2">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">The Golden Era of Royal Guilds</h2>
            <p className="text-slate-600 leading-relaxed text-lg font-light">
              During the time of the Sinhala kings, the artificer, the dancer, the weaver, and the wood carver were held in very high esteem. Art was an organized trade, with workmen formed into highly exclusive, hereditary guilds. 
            </p>
            <blockquote className="border-l-4 border-kandyan-gold pl-6 py-2 my-6 bg-slate-50 rounded-r-2xl pr-4">
              <p className="text-slate-700 italic font-medium">
                "No artificers ever changed their trade from generation to generation; but the son is the same as was his father and the daughter marries only to those of the same craft." <br/>
                <span className="text-sm font-bold text-slate-500 mt-2 block">— Robert Knox </span>
              </p>
            </blockquote>
            <p className="text-slate-600 leading-relaxed text-lg font-light">
              The most skilled craftsmen were employed permanently in the royal household, holding land from the King and receiving special gifts, such as cattle, for work well done, rather than a daily wage.
            </p>
          </div>
        </div>
      </section>

      {/* 3. THE DECLINE & THE RENAISSANCE */}
      <section className="py-20 lg:py-32 bg-slate-900 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black">The Decline & The Renaissance</h2>
              <p className="text-slate-400 leading-relaxed text-lg font-light">
                With the British conquest, the corporations of artificers lost their compact nature. The new masters had no care for the traditions of an art they could not understand, and the introduction of Western patterns degraded Eastern art. By the late 19th century, only a few individual workers remained, hidden in the Kandyan provinces.
              </p>
              <p className="text-slate-400 leading-relaxed text-lg font-light">
                Witnessing this destruction—where beautiful 17th and 18th-century architecture was decaying or being ruined by incompetent, rainbow-colored restorations—scholars like Ananda Coomaraswamy pleaded with Kandyan Chiefs to preserve these priceless historical documents.
              </p>
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 mt-6">
                <h4 className="font-bold text-kandyan-gold mb-2">The Birth of the Association (1882)</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  To revive these dying crafts, the Kandyan Art Association was formally organized in 1882 by Sir J.F. Dickson, Government Agent of the Central Province. Initially, it was a society where subscribers paid to employ the best workmen, distributing the pure Kandyan articles by lot.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative h-[400px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl">
              <Image src="/about/colonial-era.jpg" alt="Colonial Era Kandy" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
            </div>

          </div>
        </div>
      </section>

      {/* 4. OUR HISTORIC HOME TIMELINE */}
      <section className="py-20 lg:py-32 container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900">A Century of Safe Havens</h2>
          <p className="text-slate-500 mt-4 text-lg">Tracing the physical roots of our association .</p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-kandyan-gold text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <span className="text-xs font-bold">1882</span>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900">The Kandy Kachcheri</h3>
              <p className="text-sm text-slate-500 mt-2">Work was centered at the Kandy Kachcheri and a room under the United Services Library.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-kandyan-gold text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <span className="text-xs font-bold">1904</span>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900">Palle Vahala</h3>
              <p className="text-sm text-slate-500 mt-2">Moved to an 18th-century Kandyan building, reported to be the former quarters of the ladies of the Royal Household.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-kandyan-maroon text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <span className="text-xs font-bold">1924</span>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-xl border border-kandyan-maroon/20">
              <h3 className="font-bold text-kandyan-maroon">72, Sangharaja Mawatha</h3>
              <p className="text-sm text-slate-600 mt-2">Incorporated as a Trust in 1919, the association moved to its permanent home in 1924. This building was used as a military hospital during British administration.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. THE GRAND HERITAGE HALL & ARCHITECTURE */}
      <section className="py-20 lg:py-32 bg-stone-100 border-y border-stone-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900">The Centenary Expansion</h2>
              <p className="text-slate-600 leading-relaxed text-lg font-light">
                Under the vision of A.B. Damunupola (Gov. Agent 1977-1986), the association underwent a massive expansion. To mark its official centenary, the 1000-seat Kandyan Cultural Centre was opened in 1984 by H.E. President J.R. Jayewardene.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg font-light">
                Architect Minnette de Silva designed the complex to reflect true Kandyan philosophy. The 'Nrutiya Mandapa' (auditorium) features a 'Kamatha' (threshing floor) style stage integrated into the natural landscape. Eschewing modern glass and concrete, the design relies heavily on traditional flat Kandyan roofing tiles, perfectly harmonizing with the Cultural Triangle.
              </p>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-[2.5rem] overflow-hidden shadow-lg">
              <Image src="/about/minnette-design.jpg" alt="Kandyan Architecture" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. EMPOWERING THE ARTISANS (Modern Welfare) */}
      <section className="py-20 lg:py-32 container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6">Empowering Today's Master Craftsmen</h2>
          <p className="text-slate-500 text-lg">
            Today, our membership comprises over 200 craftsmen from traditional Kandyan families. We no longer just preserve art; we protect the artists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 mx-auto bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl font-black">%</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">EPF & Welfare Fund</h3>
            <p className="text-sm text-slate-500 leading-relaxed">A massive 15% of sales (9% from the association, 6% from the member) is deposited directly into a protective welfare fund.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Retirement Pensions</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Initiated in 2017 by H.M.P. Hitisekera, craftsmen over the age of 60 receive a dedicated retirement pension.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Healthcare & Grants</h3>
            <p className="text-sm text-slate-500 leading-relaxed">We provide financial assistance for eyeglasses and a Rs. 5000 donation to families in the event of a member's passing.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
            <div className="w-16 h-16 mx-auto bg-rose-50 text-kandyan-maroon rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Fair Trade Markets</h3>
            <p className="text-sm text-slate-500 leading-relaxed">We act as the medium between the purchaser and producer, guaranteeing authentic wares while ensuring highly remunerative markets for artisans.</p>
          </div>
        </div>git add
      </section>

      {/* 7. VISIT US CTA */}
      <section className="py-24 bg-slate-900 text-center px-4">
        <h2 className="text-3xl font-black text-white mb-6">Experience the Legacy</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
          The affairs of the Trust are securely managed by a Committee of Management, presided over by the Government Agent of the Kandy District. We invite you to witness our veteran craftsmen at work.
        </p>
        <p className="text-slate-500 text-sm mb-10 font-bold tracking-widest uppercase">
          Open Weekdays: 9:00 AM - 5:00 PM <br/> <span className="text-xs font-normal lowercase">(Closed on Poya & Public Holidays)</span>
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/shop" className="bg-kandyan-gold hover:bg-amber-400 text-slate-900 px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto shadow-lg hover:-translate-y-1">
            Shop the Collection
          </Link>
          <Link href="/facilities" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto">
            Book the Heritage Hall
          </Link>
        </div>
      </section>

    </main>
  );
}