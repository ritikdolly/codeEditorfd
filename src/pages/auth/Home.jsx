import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Code2, Globe, MonitorPlay, ArrowRight, Menu, X } from "lucide-react";
import myImage from "../../assets/image.webp";

export const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-gray-100 selection:bg-[#2df07b] selection:text-black relative">
      {/* ─── Top Navigation Bar ─── */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 bg-[#09090b] border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 z-50">
            <div className="bg-white p-1 rounded-sm">
              <Code2 size={20} className="text-black" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold tracking-wide text-white">
              CODEARENA
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-gray-400">
            <a href="#product" className="hover:text-white transition-colors">
              Product
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#blog" className="hover:text-white transition-colors">
              Blog
            </a>
            <a href="#docs" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#community" className="hover:text-white transition-colors">
              Community
            </a>
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-500 mr-2 text-[14px] font-medium cursor-pointer hover:text-white transition-colors">
            <Globe size={16} />
            <span>EN</span>
          </div>
          <Link
            to="/login"
            className="text-[14px] font-medium text-white hover:bg-white/10 px-4 py-2 rounded transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="bg-[#2df07b] hover:bg-[#25c464] text-black text-[14px] font-bold py-2 px-5 rounded transition-colors shadow-lg shadow-[#2df07b]/20"
          >
            Create Account
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-gray-400 hover:text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* ─── Mobile Menu Dropdown ─── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] bg-[#09090b] z-40 flex flex-col px-6 py-8 border-t border-white/5 overflow-y-auto">
          <div className="flex flex-col gap-6 font-medium text-lg text-gray-400 mb-8">
            <a
              href="#product"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Product
            </a>
            <a
              href="#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#docs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Account
            </a>
          </div>
          <div className="flex flex-col gap-4 mt-auto border-t border-white/5 pt-8">
            <Link
              to="/login"
              className="text-center font-bold text-white py-3 border border-white/20 rounded hover:bg-white/5"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-[#2df07b] text-black text-center font-bold py-3 rounded"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* ─── Hero Section ─── */}
      <header className="relative w-full min-h-[85vh] flex items-center lg:items-end pb-12 lg:pb-24 border-b border-white/5 overflow-hidden">
        {/* Synthetic Dot Matrix Background */}
        <div
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #333 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        {/* Fading Gradients for Depth */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b] pointer-events-none"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#09090b] via-transparent to-[#09090b] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 pt-24 lg:pt-32">
          {/* Left Large Headline */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-[56px] lg:text-[72px] font-bold text-white leading-[1.1] tracking-tight">
              The Real Dev Platform <br />
              <span className="text-gray-400">Ship Faster with</span> <br />
              CODEARENA
            </h1>
          </div>

          {/* Right Content & Image */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg mt-8 lg:mt-0">
              {/* Subtle green glow behind the image */}
              <div className="absolute inset-0 bg-[#2df07b]/20 blur-[80px] rounded-full pointer-events-none"></div>

              <img
                src={myImage}
                alt="Dashboard preview"
                className="relative z-10 w-full h-auto  object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Detailed Stats Section (Dark Mode) ─── */}
      <section
        className="py-24 bg-[#09090b] border-b border-white/5"
        id="stats"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Left Content */}
            <div className="lg:w-1/2 flex flex-col justify-center pt-4">
              <h2 className="text-[32px] md:text-[40px] leading-[1.2] font-bold text-white mb-6 tracking-tight">
                Empowering the next generation of software engineers.
              </h2>
              <p className="text-[17px] text-gray-400 mb-8 leading-relaxed max-w-xl">
                CodeArena is the leading global platform ensuring every
                developer has the tools to understand how modern architecture
                works, how to reason with it, and how to ship faster.
              </p>
            </div>

            {/* Right Stats Grid */}
            <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
              <div className="bg-[#111111] border border-white/10 rounded p-8 flex flex-col items-center justify-center text-center">
                <div className="text-[40px] font-bold text-white leading-none mb-2">
                  107M
                </div>
                <div className="text-[14px] font-medium text-gray-500">
                  Lines of Code
                </div>
              </div>
              <div className="bg-[#111111] border border-white/10 rounded p-8 flex flex-col items-center justify-center text-center">
                <div className="text-[40px] font-bold text-white leading-none mb-2">
                  1.94B
                </div>
                <div className="text-[14px] font-medium text-gray-500 leading-snug">
                  Builds executed
                </div>
              </div>
              <div className="col-span-2 bg-[#111111] border border-white/10 rounded p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2df07b]/5 blur-[60px] rounded-full"></div>
                <div className="text-[14px] font-medium text-[#2df07b] mb-2 uppercase tracking-widest">
                  Global Reach
                </div>
                <div className="text-[40px] font-bold text-white leading-none">
                  190 Countries
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Target Audience Pathways (Sleek Dark Cards) ─── */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12" id="learn">
        <div className="mb-16">
          <h2 className="text-[32px] font-bold text-white mb-4">
            Choose your learning path
          </h2>
          <p className="text-[17px] text-gray-400 max-w-2xl">
            Comprehensive curriculum, interactive environments, and
            project-based workflows for every skill level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Path 1 */}
          <div className="group bg-[#111111] rounded border border-white/10 flex flex-col cursor-pointer hover:border-white/20 transition-all">
            <div className="h-48 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="relative z-10 text-2xl font-bold text-white tracking-tight">
                Beginner
              </h3>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <p className="text-gray-400 mb-8 flex-1 text-[15px] leading-relaxed">
                Master the fundamentals of logic, syntax, and basic problem
                solving in a guided environment.
              </p>
              <span className="text-[#2df07b] font-medium flex items-center gap-2 group-hover:gap-3 transition-all text-[15px]">
                Start Path <ArrowRight size={18} />
              </span>
            </div>
          </div>

          {/* Path 2 */}
          <div className="group bg-[#111111] rounded border border-white/10 flex flex-col cursor-pointer hover:border-white/20 transition-all">
            <div className="h-48 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2df07b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="relative z-10 text-2xl font-bold text-white tracking-tight">
                Intermediate
              </h3>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <p className="text-gray-400 mb-8 flex-1 text-[15px] leading-relaxed">
                Transition to complex text-based programming while building real
                apps and microservices.
              </p>
              <span className="text-[#2df07b] font-medium flex items-center gap-2 group-hover:gap-3 transition-all text-[15px]">
                Start Path <ArrowRight size={18} />
              </span>
            </div>
          </div>

          {/* Path 3 */}
          <div className="group bg-[#111111] rounded border border-white/10 flex flex-col cursor-pointer hover:border-white/20 transition-all">
            <div className="h-48 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="relative z-10 text-2xl font-bold text-white tracking-tight">
                Advanced
              </h3>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <p className="text-gray-400 mb-8 flex-1 text-[15px] leading-relaxed">
                Advanced data structures, cloud architecture, and AI/Machine
                Learning concepts for career prep.
              </p>
              <span className="text-[#2df07b] font-medium flex items-center gap-2 group-hover:gap-3 transition-all text-[15px]">
                Start Path <ArrowRight size={18} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="bg-[#111111] border-y border-white/10 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2df07b]/30 bg-[#2df07b]/10 text-[#2df07b] font-medium text-xs mb-6 tracking-wide uppercase">
            <MonitorPlay size={14} /> Available Now
          </div>
          <h2 className="text-[32px] md:text-[48px] font-bold text-white mb-6 tracking-tight">
            Start Coding faster today.
          </h2>
          <p className="text-[17px] text-gray-400 mb-10">
            Join thousands of developers building the future. Set up your
            environment in seconds and deploy instantly.
          </p>
          <button className="bg-white hover:bg-gray-200 text-black font-bold py-3.5 px-10 rounded transition-colors text-[15px]">
            Get Started for Free
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#09090b] text-gray-500 py-12 text-center text-[14px]">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Code2 size={20} className="text-gray-600" />
        </div>
        <p>© 2026 CodeArena Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
