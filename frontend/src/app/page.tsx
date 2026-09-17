"use client";

import React from "react";
import Link from "next/link";
import {
  UploadCloud,
  Sparkles,
  Building2,
  Route,
  Hexagon,
  ShieldCheck,
  BarChart3,
  FileOutput,
  ArrowRight,
  Layers,
  Cpu,
  Compass,
  Check,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const defaultProjectId = "6aabb5f492fa58e7033199dc";

  return (
    <div className="min-h-screen bg-[#FBFAF7] text-[#211F1C] flex flex-col font-sans selection:bg-oxblood-tint selection:text-oxblood antialiased">
      
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#FBFAF7]/90 backdrop-blur-md border-b border-[#EAE6DF] px-6 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center">
            <img
              src="/images/prism-logo.png"
              alt="PRISM Logo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#52525B]">
            <a href="#features" className="hover:text-[#7A1E2E] transition-colors">Features</a>
            <a href="#showcase" className="hover:text-[#7A1E2E] transition-colors">Visual Studio</a>
            <a href="#about" className="hover:text-[#7A1E2E] transition-colors">About</a>
            <a href="#workflow" className="hover:text-[#7A1E2E] transition-colors">Workflow</a>
            <Link href={`/projects/${defaultProjectId}/analytics`} className="hover:text-[#7A1E2E] transition-colors">Insights</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${defaultProjectId}/upload`}
              className="flex items-center gap-2 bg-[#6D1B28] hover:bg-[#5C1521] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles size={15} />
              <span>Launch Cadastral Studio</span>
              <ArrowRight size={14} className="ml-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Enhanced with Ultra-Low-Opacity Cadastral Grid & Flowing Gradient Lights */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20 px-4 sm:px-6 lg:px-12 bg-[#FAF8F5] border-b border-[#EAE6DF]">
        
        {/* Ultra-Delicate Cadastral Geo-Grid Dot Matrix (Very Low Opacity) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] [background-image:radial-gradient(#7A1E2E_1px,transparent_1px)] [background-size:28px_28px]" />
        
        {/* Very Soft Topographical Wave Lines (Ultra Subtle) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 200 C300 150, 600 450, 1100 250 C1300 170, 1500 320, 1600 300" stroke="#7A1E2E" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35"/>
            <path d="M-100 260 C320 200, 650 500, 1150 290 C1350 210, 1520 370, 1600 350" stroke="#7A1E2E" strokeWidth="0.8" opacity="0.25"/>
            <path d="M-100 320 C340 250, 700 550, 1200 330 C1400 250, 1540 420, 1600 400" stroke="#7A1E2E" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.2"/>
            <path d="M-100 380 C360 300, 750 600, 1250 370 C1450 290, 1560 470, 1600 450" stroke="#7A1E2E" strokeWidth="0.8" opacity="0.15"/>
            <path d="M-100 440 C380 350, 800 650, 1300 410 C1500 330, 1580 520, 1600 500" stroke="#7A1E2E" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.1"/>
          </svg>
        </div>

        {/* Flowing Ambient Gradient Lights (Very Low Opacity & Ethereal Glow) */}
        <div className="absolute -top-16 left-1/4 w-[600px] h-[400px] bg-gradient-to-tr from-rose-300 via-amber-200 to-rose-400 rounded-full blur-[120px] pointer-events-none animate-light-flow-1" />
        <div className="absolute top-1/3 right-4 w-[500px] h-[360px] bg-gradient-to-bl from-rose-400 via-pink-200 to-amber-200 rounded-full blur-[130px] pointer-events-none animate-light-flow-2" />
        <div className="absolute -bottom-16 left-1/3 w-[480px] h-[300px] bg-gradient-to-r from-red-300 via-rose-200 to-amber-100 rounded-full blur-[110px] pointer-events-none animate-light-flow-3" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-start">
            
            {/* Left Column: Typography, CTAs, Process Capsules */}
            <div className="lg:col-span-6 space-y-6 pt-2">
              
              {/* Badge with Live Pulse */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FDF2F4] px-4 py-1.5 border border-[#F5D0D6] text-xs font-bold text-[#7A1E2E] shadow-xs hover:border-[#7A1E2E]/40 transition-colors">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7A1E2E]" />
                </span>
                <Zap size={14} className="text-[#7A1E2E] fill-[#7A1E2E]/20" />
                <span>PRISM:Parcel Recognition and Intelligent Spatial Mapping</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#111827] tracking-tight leading-[1.08]">
                Instant Cadastral <br />
                <span className="text-[#7A1E2E] drop-shadow-xs">Mapping</span> from <br />
                Drone & Aerial Surveys
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#52525B] leading-relaxed max-w-xl">
                Transform raw drone imagery and orthomosaics into vectorized building perimeters, road networks, and georeferenced deed parcel boundaries with deep learning precision.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href={`/projects/${defaultProjectId}/upload`}
                  className="group flex items-center gap-2.5 bg-[#6D1B28] hover:bg-[#58141F] text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <UploadCloud size={18} className="transform group-hover:-translate-y-0.5 transition-transform" />
                  <span>Start Automated Mapping</span>
                  <ArrowRight size={15} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#showcase"
                  className="flex items-center gap-2 bg-white hover:bg-zinc-50 text-[#1E293B] font-semibold text-sm px-5 py-3.5 rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Layers size={17} className="text-[#7A1E2E]" />
                  <span>Explore Live Studio</span>
                </a>
              </div>

              {/* 4 Process Step Capsules with Hover Elevation & Micro-Glow */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="flex items-center gap-2 p-2.5 bg-white/90 backdrop-blur-xs rounded-xl border border-zinc-200/80 shadow-2xs hover:border-[#7A1E2E]/40 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-default">
                  <div className="h-8 w-8 rounded-lg bg-[#FDF2F4] text-[#7A1E2E] flex items-center justify-center shrink-0 border border-[#F5D0D6]">
                    <Hexagon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#1E293B] leading-tight truncate">Upload imagery</p>
                    <p className="text-[9px] text-[#71717A] leading-tight truncate">Drone / Aerial / Satellite</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white/90 backdrop-blur-xs rounded-xl border border-zinc-200/80 shadow-2xs hover:border-[#7A1E2E]/40 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-default">
                  <div className="h-8 w-8 rounded-lg bg-[#FDF2F4] text-[#7A1E2E] flex items-center justify-center shrink-0 border border-[#F5D0D6]">
                    <Sparkles size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#1E293B] leading-tight truncate">AI Processing</p>
                    <p className="text-[9px] text-[#71717A] leading-tight truncate">Deep Learning Models</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white/90 backdrop-blur-xs rounded-xl border border-zinc-200/80 shadow-2xs hover:border-[#7A1E2E]/40 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-default">
                  <div className="h-8 w-8 rounded-lg bg-[#FDF2F4] text-[#7A1E2E] flex items-center justify-center shrink-0 border border-[#F5D0D6]">
                    <Compass size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#1E293B] leading-tight truncate">Accurate Outputs</p>
                    <p className="text-[9px] text-[#71717A] leading-tight truncate">Vectors & Boundaries</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white/90 backdrop-blur-xs rounded-xl border border-zinc-200/80 shadow-2xs hover:border-[#7A1E2E]/40 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-default">
                  <div className="h-8 w-8 rounded-lg bg-[#FDF2F4] text-[#7A1E2E] flex items-center justify-center shrink-0 border border-[#F5D0D6]">
                    <FileOutput size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#1E293B] leading-tight truncate">Ready to Use</p>
                    <p className="text-[9px] text-[#71717A] leading-tight truncate">GIS / CAD / Web</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: 3D Drone Isometric Scene & Real-World Impact */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center space-y-6">

              {/* Main 3D Drone Plate Image with Subtle Scanner Beam Effect */}
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/90 bg-white group">
                <img
                  src="/images/hero-drone-terrain.jpg"
                  alt="Drone Cadastral AI Scanning"
                  className="w-full h-auto object-cover block transform transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
                {/* Subtle Cadastral Corner Crosshairs */}
                <div className="absolute top-3 left-3 text-xs font-mono text-white/50 select-none pointer-events-none">⌜ 42°21'N</div>
                <div className="absolute top-3 right-3 text-xs font-mono text-white/50 select-none pointer-events-none">⌝ EPSG:4326</div>
                <div className="absolute bottom-3 left-3 text-xs font-mono text-white/50 select-none pointer-events-none">⌞ WGS84</div>
                <div className="absolute bottom-3 right-3 text-xs font-mono text-white/50 select-none pointer-events-none">⌟ 71°03'W</div>
              </div>

              {/* Bottom Real-World Impact 3 Distinct Drone Capture Tiles & Tag (Including test2.png) */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 px-1">
                
                {/* 3 Distinct Angled Drone Imagery Preview Cards featuring test2.png */}
                <div className="flex items-center gap-3">
                  <div className="w-20 sm:w-24 h-13 sm:h-14 rounded-xl overflow-hidden border-2 border-white shadow-md transform -skew-x-6 hover:skew-x-0 transition-transform bg-zinc-900 relative group/tile cursor-pointer">
                    <img
                      src="/images/impact-1-farmland.jpg"
                      alt="Agricultural Cadastral Survey"
                      className="w-full h-full object-cover transform group-hover/tile:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-emerald-950/15 group-hover/tile:opacity-0 transition-opacity" />
                  </div>

                  <div className="w-20 sm:w-24 h-13 sm:h-14 rounded-xl overflow-hidden border-2 border-white shadow-md transform -skew-x-6 hover:skew-x-0 transition-transform bg-zinc-900 relative group/tile cursor-pointer">
                    <img
                      src="/images/test2.png"
                      alt="Cadastral Photogrammetry Test Survey"
                      className="w-full h-full object-cover transform group-hover/tile:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-rose-950/15 group-hover/tile:opacity-0 transition-opacity" />
                  </div>

                  <div className="w-20 sm:w-24 h-13 sm:h-14 rounded-xl overflow-hidden border-2 border-white shadow-md transform -skew-x-6 hover:skew-x-0 transition-transform bg-zinc-900 relative group/tile cursor-pointer">
                    <img
                      src="/images/impact-3-infrastructure.png"
                      alt="Highway Infrastructure Corridors"
                      className="w-full h-full object-cover transform group-hover/tile:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/15 group-hover/tile:opacity-0 transition-opacity" />
                  </div>
                </div>

                {/* Right Caption with Horizontal Accent Line */}
                <div className="text-right flex flex-col items-end">
                  <div className="w-16 h-0.5 bg-[#1E293B] mb-1 opacity-70" />
                  <p className="text-[10px] font-black tracking-wider text-[#1E293B] uppercase">REAL-WORLD IMPACT</p>
                  <p className="text-[8px] font-bold tracking-widest text-[#71717A] uppercase">ACROSS LAND, CITIES & INFRASTRUCTURE</p>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Interactive Visual Showcase Section */}
      <section id="showcase" className="relative py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EAE6DF] overflow-hidden">
        
        {/* Cadastral Coordinate Grid Lines (Ultra Subtle Very Low Opacity) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] [background-image:linear-gradient(to_right,#7A1E2E_1px,transparent_1px),linear-gradient(to_bottom,#7A1E2E_1px,transparent_1px)] [background-size:48px_48px]" />

        {/* Gentle Ambient Flowing Lights (Very Low Opacity) */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[340px] bg-gradient-to-r from-rose-200 via-pink-100 to-amber-100 rounded-full blur-[120px] pointer-events-none animate-light-flow-2" />
        <div className="absolute bottom-10 right-1/4 w-[420px] h-[280px] bg-gradient-to-bl from-rose-300 via-orange-100 to-rose-200 rounded-full blur-[110px] pointer-events-none animate-light-flow-3" />

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FDF2F4] px-4 py-1 border border-[#F5D0D6] text-xs font-bold text-[#7A1E2E] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7A1E2E] animate-pulse" />
              <span>Interactive Photogrammetry Canvas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              Real-Time Photogrammetry Vectorization Studio
            </h2>
            <p className="text-sm sm:text-base text-[#52525B]">
              Multi-class AI vision segments rooflines, arterial roadways, and property parcels over high-resolution aerial photography.
            </p>
          </div>

          {/* Interactive Showcase Container with Grid HUD */}
          <div className="rounded-3xl border-2 border-[#EAE6DF] bg-[#FAF8F5] overflow-hidden shadow-2xl p-4 sm:p-6 space-y-5">
            
            {/* Header info bar with live telemetry ticker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE6DF]">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
                <span className="text-sm sm:text-base font-bold text-[#111827] font-mono">Live Photogrammetric Vector Plate</span>
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ONLINE 100%
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#52525B]">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-[#EAE6DF] shadow-2xs">
                  <Compass size={13} className="text-[#7A1E2E]" />
                  <span>Datum: WGS84 (EPSG:4326)</span>
                </div>
                <div className="hidden md:flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-[#EAE6DF] shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span>Grid: 0.05m GSD</span>
                </div>
              </div>
            </div>

            {/* Showcase High-Res Plate Image with Geometric Grid Markers */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-300 shadow-inner group">
              <img
                src="/images/cadastral-ai-showcase.jpg"
                alt="PRISM AI Cadastral Photogrammetry Vectorization"
                className="w-full h-auto object-cover block"
              />
              
              {/* Corner HUD Overlay Coordinates */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                LAT: 42°21'28.4"N
              </div>
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                LON: 71°03'42.1"W
              </div>
            </div>

            {/* Bottom HUD Telemetry Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-[#EAE6DF] shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">🏢</div>
                  <div>
                    <p className="text-[10px] text-[#71717A] font-medium leading-tight">Building Contours</p>
                    <p className="text-xs font-bold text-[#111827]">18 Non-Box Vectors</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">99.4% Acc</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#EAE6DF] shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">🛣️</div>
                  <div>
                    <p className="text-[10px] text-[#71717A] font-medium leading-tight">Road Network</p>
                    <p className="text-xs font-bold text-[#111827]">312.5m Centerlines</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Topological</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#EAE6DF] shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">📐</div>
                  <div>
                    <p className="text-[10px] text-[#71717A] font-medium leading-tight">Deed Boundaries</p>
                    <p className="text-xs font-bold text-[#111827]">16 Cadastral Lots</p>
                  </div>
                </div>
                <Link href={`/projects/${defaultProjectId}/upload`} className="text-[10px] font-bold text-[#7A1E2E] hover:underline flex items-center gap-0.5">
                  Launch Studio <ArrowRight size={10} />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Features Section - Bento Grid Layout */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-12 border-b border-[#EAE6DF] bg-[#FAF8F5] overflow-hidden">
        
        {/* Subtle Dots Grid (Ultra Low Opacity) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] [background-image:radial-gradient(#7A1E2E_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Gentle Ambient Flowing Light */}
        <div className="absolute top-10 right-1/4 w-[500px] h-[320px] bg-gradient-to-br from-rose-200 via-pink-100 to-amber-200 rounded-full blur-[120px] pointer-events-none animate-light-flow-1" />
        <div className="absolute -bottom-10 left-10 w-[450px] h-[300px] bg-gradient-to-tr from-amber-100 via-rose-200 to-red-100 rounded-full blur-[110px] pointer-events-none animate-light-flow-2" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
              <Sparkles size={13} className="text-emerald-600" />
              <span>Core Intelligence Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              Enterprise Cadastral Photogrammetry Features
            </h2>
            <p className="text-sm sm:text-base text-[#52525B]">
              Engineered for municipal surveyors, land administrators, and GIS engineers needing millimeter-accurate boundary demarcation.
            </p>
          </div>

          {/* Bento Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] hover:shadow-lg hover:border-[#7A1E2E]/40 hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <span className="text-[10px] font-mono font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">
                  POLY_VERTEX
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#7A1E2E] transition-colors">Multi-Vertex Building Perimeter Vectors</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Eliminates box approximations. Traces true 6-to-16 coordinate architectural perimeter polygons circumscribing complex L-shapes, wings, and stepped facades.
              </p>
              <div className="text-xs font-semibold text-red-700 bg-red-50/90 p-2.5 rounded-xl border border-red-100 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-red-600 shrink-0" />
                <span>Non-rectangular roof contour extraction</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] hover:shadow-lg hover:border-[#7A1E2E]/40 hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Route size={24} />
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                  TOPOLOGY_LINE
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#7A1E2E] transition-colors">Road Corridor & Centerline Network</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Extracts smooth topological road centerlines with automated width estimation, class identification, and paved asphalt area calculations.
              </p>
              <div className="text-xs font-semibold text-blue-700 bg-blue-50/90 p-2.5 rounded-xl border border-blue-100 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Centerline nodes & width buffer measurement</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] hover:shadow-lg hover:border-[#7A1E2E]/40 hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Hexagon size={24} />
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
                  DEED_PARCEL
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#7A1E2E] transition-colors">Cadastral Deed Boundaries & Zoning</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Generates georeferenced parcel boundaries with assigned Lot IDs (`PRC-001` to `PRC-018`) and multi-class zoning land use classification.
              </p>
              <div className="text-xs font-semibold text-amber-700 bg-amber-50/90 p-2.5 rounded-xl border border-amber-100 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                <span>100% closed ring geometry compliance</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] hover:shadow-lg hover:border-[#7A1E2E]/40 hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
                  ZERO_OVERLAP
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#7A1E2E] transition-colors">In-Situ Boundary & Overlap Topology Check</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Automated OGC topology audit right on the uploaded image. Verifies zero boundary overlaps, slivers, or illegal property encroachments.
              </p>
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>0 Overlaps / Strict deed boundary verification</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] hover:shadow-lg hover:border-[#7A1E2E]/40 hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-[#FDF2F4] border border-[#F5D0D6] flex items-center justify-center text-[#7A1E2E] group-hover:scale-110 transition-transform">
                  <BarChart3 size={24} />
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#FDF2F4] text-[#7A1E2E] px-2 py-0.5 rounded border border-[#F5D0D6]">
                  SHOELACE_M²
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#7A1E2E] transition-colors">Geodesic Area & Dimension Metrics</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Real-time Shoelace geodesic area computations for every polygon in m², hectares (ha), and sq ft, with perimeter length meters.
              </p>
              <div className="text-xs font-semibold text-[#7A1E2E] bg-[#FDF2F4]/90 p-2.5 rounded-xl border border-[#F5D0D6] flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#7A1E2E] shrink-0" />
                <span>Dynamic hover cards & cadastral schedules</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] hover:shadow-lg hover:border-[#7A1E2E]/40 hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <FileOutput size={24} />
                </div>
                <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                  PDF_PLATES
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#7A1E2E] transition-colors">Master Cadastral Survey Certificate</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                1-Click generation of official multi-plate cadastral survey dossiers with embedded imagery, vector layers, lot schedules, and PDF export.
              </p>
              <div className="text-xs font-semibold text-purple-700 bg-purple-50/90 p-2.5 rounded-xl border border-purple-100 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-purple-600 shrink-0" />
                <span>Direct PDF report & GIS export downloads</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Platform Specifications & Architecture Section */}
      <section id="about" className="relative py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-[#EAE6DF] overflow-hidden">
        
        {/* Subtle Background Coordinate Dot Matrix (Ultra Low Opacity) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] [background-image:radial-gradient(#7A1E2E_1px,transparent_1px)] [background-size:32px_32px]" />

        {/* Gentle Ambient Flowing Light (Very Low Opacity) */}
        <div className="absolute bottom-10 left-10 w-[500px] h-[340px] bg-gradient-to-tr from-rose-200 via-red-100 to-amber-100 rounded-full blur-[130px] pointer-events-none animate-light-flow-3" />
        <div className="absolute top-10 right-10 w-[450px] h-[300px] bg-gradient-to-bl from-rose-200 via-pink-100 to-orange-100 rounded-full blur-[120px] pointer-events-none animate-light-flow-1" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1 text-xs font-bold text-[#1E293B]">
                <Cpu size={13} className="text-[#7A1E2E]" />
                <span>Modern Spatial Infrastructure</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
                Architected for Modern Land Administration & Digital Deeds
              </h2>
              <p className="text-base text-[#52525B] leading-relaxed">
                PRISM is an end-to-end aerial photogrammetry intelligence engine built to streamline cadastral surveys, property tax mapping, and municipal infrastructure management.
              </p>
              
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] hover:border-[#7A1E2E]/30 transition-all">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#111827]">Deep Learning Instance Segmentation</p>
                    <p className="text-xs text-[#71717A] mt-0.5">Trained on dense urban and rural aerial datasets to distinguish roof edges, setbacks, and land-use classes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] hover:border-[#7A1E2E]/30 transition-all">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#111827]">OGC Topological Rule Compliance</p>
                    <p className="text-xs text-[#71717A] mt-0.5">Ensures every cadastral polygon conforms to digital deed standards with valid vertex winding and zero overlapping boundaries.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] hover:border-[#7A1E2E]/30 transition-all">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#111827]">Georeferenced Standard GIS Exports</p>
                    <p className="text-xs text-[#71717A] mt-0.5">Instant export to GeoJSON, Shapefile (SHP), and CSV spreadsheet formats compatible with ArcGIS, QGIS, and AutoCAD.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/projects/${defaultProjectId}/upload`}
                  className="inline-flex items-center gap-2 bg-[#6D1B28] hover:bg-[#58141F] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Enter AI Studio Workspace</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Visual Specs Card Grid */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border-2 border-[#EAE6DF] shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
                <span className="font-bold text-sm text-[#111827] flex items-center gap-2">
                  <Cpu size={18} className="text-[#7A1E2E]" /> Engine & Format Specifications
                </span>
                <span className="text-xs font-mono font-bold text-[#7A1E2E] bg-[#FDF2F4] px-2.5 py-0.5 rounded-full border border-[#F5D0D6]">
                  v2.5 Release
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-[#EAE6DF] shadow-2xs">
                  <span className="text-[#71717A] font-medium">Image Formats:</span>
                  <span className="font-bold text-[#111827]">Drone RGB (JPG/PNG), GeoTIFF, DSM</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-[#EAE6DF] shadow-2xs">
                  <span className="text-[#71717A] font-medium">Coordinate Systems:</span>
                  <span className="font-bold text-[#111827]">WGS84 (EPSG:4326), UTM Zone Grids</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-[#EAE6DF] shadow-2xs">
                  <span className="text-[#71717A] font-medium">Vector Classes:</span>
                  <span className="font-bold text-[#111827]">Buildings, Roads, Plots, Corridors</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-[#EAE6DF] shadow-2xs">
                  <span className="text-[#71717A] font-medium">Topology Validation:</span>
                  <span className="font-bold text-emerald-600">Zero-Overlap Encroachment Scanner</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-[#EAE6DF] shadow-2xs">
                  <span className="text-[#71717A] font-medium">Reporting Dossier:</span>
                  <span className="font-bold text-[#7A1E2E]">Multi-Plate PDF Certificate + GeoJSON</span>
                </div>
              </div>

              {/* Supported Formats Grid Badges */}
              <div className="pt-2 border-t border-[#EAE6DF]">
                <p className="text-[11px] font-bold text-[#52525B] mb-2 uppercase tracking-wider">Export Interoperability</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono font-bold bg-white text-[#111827] px-2.5 py-1 rounded-lg border border-[#EAE6DF]">.GeoJSON</span>
                  <span className="text-[10px] font-mono font-bold bg-white text-[#111827] px-2.5 py-1 rounded-lg border border-[#EAE6DF]">.SHP (Shapefile)</span>
                  <span className="text-[10px] font-mono font-bold bg-white text-[#111827] px-2.5 py-1 rounded-lg border border-[#EAE6DF]">.DXF (AutoCAD)</span>
                  <span className="text-[10px] font-mono font-bold bg-white text-[#111827] px-2.5 py-1 rounded-lg border border-[#EAE6DF]">.CSV (Deed Roll)</span>
                  <span className="text-[10px] font-mono font-bold bg-white text-[#111827] px-2.5 py-1 rounded-lg border border-[#EAE6DF]">.PDF (Dossier)</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3-Step Automated Pipeline Workflow Section */}
      <section id="workflow" className="relative py-20 px-4 sm:px-6 lg:px-12 border-b border-[#EAE6DF] bg-[#FAF8F5] overflow-hidden">
        
        {/* Subtle Background Coordinate Dot Matrix (Ultra Low Opacity) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] [background-image:radial-gradient(#7A1E2E_1px,transparent_1px)] [background-size:28px_28px]" />

        {/* Gentle Ambient Flowing Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] bg-gradient-to-r from-rose-200 via-amber-100 to-rose-300 rounded-full blur-[130px] pointer-events-none animate-light-flow-1" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1 border border-amber-200 text-xs font-bold text-amber-800 shadow-2xs">
              <Zap size={13} className="text-amber-600" />
              <span>Automated Cadastral Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              From Drone Photo to Survey Certificate in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs hover:shadow-xl hover:border-[#7A1E2E]/40 hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-[#7A1E2E]/20 font-mono group-hover:text-[#7A1E2E]/40 transition-colors">01</span>
                <span className="text-[10px] font-mono font-bold bg-zinc-100 text-[#52525B] px-2 py-0.5 rounded">INGEST</span>
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Upload Drone Imagery</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Drag and drop aerial drone photos or orthomosaics. PRISM automatically calibrates resolution, dimensions, and coordinates.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs hover:shadow-xl hover:border-[#7A1E2E]/40 hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-blue-600/20 font-mono group-hover:text-blue-600/40 transition-colors">02</span>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">INFERENCE</span>
              </div>
              <h3 className="text-lg font-bold text-[#111827]">AI Feature Extraction</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Deep learning models identify building contours, roads, and land-use parcels directly on the photograph with zero box approximations.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs hover:shadow-xl hover:border-[#7A1E2E]/40 hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-emerald-600/20 font-mono group-hover:text-emerald-600/40 transition-colors">03</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">DOSSIER</span>
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Audit & Download Certificate</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Inspect boundary topology, verify zero overlaps, and export official Cadastral Survey Certificates and GIS layers.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#6D1B28] via-[#7A1E2E] to-[#4F131C] text-white overflow-hidden">
        
        {/* Subtle Background Geometry Grid (Very Low Opacity) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
        
        {/* Gentle Ambient Flowing Light */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[250px] bg-rose-400 rounded-full blur-[100px] opacity-10 pointer-events-none animate-light-flow-2" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Automate Your Cadastral Mapping?
          </h2>
          <p className="text-base text-white/85 max-w-xl mx-auto">
            Upload your aerial drone imagery and generate sub-meter vector parcel polygons in seconds.
          </p>
          <div className="pt-3 flex justify-center">
            <Link
              href={`/projects/${defaultProjectId}/upload`}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white text-[#6D1B28] font-bold text-base px-8 py-4 shadow-xl hover:bg-zinc-100 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles size={20} className="text-[#6D1B28]" />
              <span>Launch AI Cadastral Studio Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#EAE6DF] py-8 px-4 sm:px-6 lg:px-12 text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center">
            <img
              src="/images/prism-logo.png"
              alt="PRISM Logo"
              className="h-7 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-6">
            <Link href={`/projects/${defaultProjectId}/upload`} className="hover:text-[#7A1E2E] font-semibold">Studio</Link>
            <Link href={`/projects/${defaultProjectId}/analytics`} className="hover:text-[#7A1E2E] font-semibold">Insights</Link>
            <Link href={`/projects/${defaultProjectId}/assistant`} className="hover:text-[#7A1E2E] font-semibold">AI Assistant</Link>
            <Link href={`/projects/${defaultProjectId}/exports`} className="hover:text-[#7A1E2E] font-semibold">GIS Exports</Link>
          </div>

          <p>© 2026 PRISM Cadastral Platform. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
