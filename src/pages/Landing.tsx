import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaNewspaper, FaImages, FaUsers, FaStethoscope, FaLock } from 'react-icons/fa';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent tracking-tight">DocNet</h1>
          <div className="flex gap-3 items-center">
            <Link to="/login" className="px-5 py-2.5 text-slate-600 hover:text-primary-600 font-medium transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary shadow-primary-500/25">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 pb-32">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
          <div className="w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
          <div className="w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-semibold mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
            The Premium Network for Medical Professionals
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Connect, Collaborate, & <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">Advance Healthcare</span>
          </h2>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Join thousands of doctors organizing events, discussing breakthroughs, and building a stronger professional presence.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-4 shadow-primary-500/25"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-8 pb-24 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaCalendarAlt className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Conferences & Events</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Organize and participate in exclusive medical conferences, workshops, and meetups.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaNewspaper className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Medical Insights</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Share and discuss the latest medical news, research papers, and clinical practices.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaImages className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Event Galleries</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Create beautiful photo galleries from your medical events and share them with attendees.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Global Network</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Connect with highly qualified doctors across various specialties worldwide.</p>
          </div>
        </div>
      </section>

      {/* Highlight Section */}
      <section className="bg-white border-y border-slate-200/50 py-24 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlNWEzYjMiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Seamless & Secure Payments for Events</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Host paid conferences and workshops with confidence. Our integrated Stripe payment processing ensures attendees pay safely and you receive funds instantly and securely.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50 border border-slate-100 p-3 rounded-lg w-fit">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <FaLock className="w-3.5 h-3.5" />
                  </div>
                  Secure Encrypted Transactions
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50 border border-slate-100 p-3 rounded-lg w-fit">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <FaLock className="w-3.5 h-3.5" />
                  </div>
                  Direct payouts to your bank account
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary-600 to-blue-500 p-[1px] rounded-[2rem] shadow-2xl shadow-primary-500/20">
              <div className="bg-white p-10 rounded-[calc(2rem-1px)] h-full">
                <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-8">
                  <FaStethoscope className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Engineered for Excellence</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Every feature has been meticulously crafted to support the high demanding workflows of modern medical professionals, enabling you to focus on what matters most—advancing medicine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white tracking-tight">DocNet</h3>
              <p className="text-slate-400 mt-2 font-medium">The Premium Network for Medical Professionals</p>
            </div>
            <p className="text-sm font-medium text-slate-500">© 2024 DocNet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
