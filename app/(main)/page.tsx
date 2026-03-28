import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  UserPlus, 
  ShieldCheck, 
  FileDown, 
  LayoutDashboard, 
  ArrowRight, 
  CheckCircle2,
  ChevronRight,
  Lock,
  Sparkles,
  Zap
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-950 selection:bg-primary/20 font-sans">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-36 lg:pb-32">
        {/* Native v4 Mask & bg-size */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Extended spacing scale: size-150 (600px), size-200 (800px) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-150 lg:size-200 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <Link 
            href="/signup" 
            className="inline-flex items-center rounded-full inset-ring-1 inset-ring-primary/20 bg-primary/5 hover:bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 transition-colors"
          >
            <Sparkles className="size-4 mr-2" />
            Introducing Batch TC Generation
            <ChevronRight className="ml-1 size-4 opacity-50" />
          </Link>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance bg-linear-to-b from-gray-950 to-gray-600 bg-clip-text text-transparent mb-6">
            The modern OS for school administration.
          </h1>

          <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed text-balance mb-10">
            Ditch the spreadsheets. Streamline your student records and generate flawless, verifiable Transfer Certificates in a matter of seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto z-10">
            <Button asChild size="lg" className="h-14 px-8 rounded-full w-full sm:w-auto group text-base shadow-xl shadow-primary/20">
              <Link href="/signup">
                Start for free
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full w-full sm:w-auto bg-white hover:bg-gray-50 text-base inset-ring-1 inset-ring-gray-200 border-0">
              <Link href="/dashboard">View Demo Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* HERO MOCKUP (Floating Glass Dashboard) */}
        <div className="max-w-5xl mx-auto px-4 mt-20 relative z-10 perspective-[2000px]">
          {/* rounded-[2rem] -> rounded-4xl */}
          <div className="rounded-4xl bg-white/60 backdrop-blur-2xl inset-ring-1 inset-ring-gray-200/50 shadow-2xl shadow-gray-200/50 overflow-hidden transform-gpu transition-transform duration-700 hover:rotate-x-2">
            
            <div className="flex items-center gap-2 px-4 py-3 bg-white/40 border-b border-gray-100/50">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400/90" />
                <div className="size-3 rounded-full bg-amber-400/90" />
                <div className="size-3 rounded-full bg-emerald-400/90" />
              </div>
              <div className="mx-auto px-4 py-1.5 rounded-lg bg-white/60 inset-ring-1 inset-ring-gray-200/50 text-xs text-gray-500 font-medium flex items-center gap-2">
                <Lock className="size-3.5" /> app.schoolos.com
              </div>
            </div>

            {/* h-[400px] -> h-100 */}
            <div className="p-4 md:p-8 flex gap-6 h-100">
              <div className="hidden md:flex flex-col gap-4 w-52 shrink-0">
                <div className="size-10 bg-primary/10 rounded-xl mb-4 flex items-center justify-center text-primary">
                  <LayoutDashboard className="size-5" />
                </div>
                <div className="h-4 w-full bg-gray-200/50 rounded-md" />
                <div className="h-4 w-4/5 bg-gray-200/50 rounded-md" />
                <div className="h-4 w-5/6 bg-gray-200/50 rounded-md" />
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="h-8 w-48 bg-gray-200/50 rounded-lg" />
                  <div className="h-10 w-32 bg-primary/10 rounded-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-2xl bg-white inset-ring-1 inset-ring-gray-100 p-5 flex flex-col justify-between shadow-sm">
                      <div className="h-4 w-1/2 bg-gray-100 rounded-md" />
                      <div className="h-8 w-1/3 bg-gray-200/70 rounded-md" />
                    </div>
                  ))}
                </div>
                <div className="h-48 w-full rounded-2xl bg-white inset-ring-1 inset-ring-gray-100 shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS / TRUST BAR */}
      <section className="bg-white inset-ring-y-1 inset-ring-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div className="space-y-2">
              <h4 className="text-4xl font-extrabold text-gray-950">10k+</h4>
              <p className="text-sm text-gray-500 font-medium">Students Managed</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl font-extrabold text-gray-950">99.9%</h4>
              <p className="text-sm text-gray-500 font-medium">Uptime Guarantee</p>
            </div>
            <div className="space-y-2 hidden md:block">
              <h4 className="text-4xl font-extrabold text-gray-950">0</h4>
              <p className="text-sm text-gray-500 font-medium">Lost Records</p>
            </div>
            <div className="space-y-2 hidden md:block">
              <h4 className="text-4xl font-extrabold text-gray-950">1s</h4>
              <p className="text-sm text-gray-500 font-medium">TC Generation</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - BENTO GRID */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-950 text-balance">
            Everything you need. <br className="hidden sm:block"/> Nothing you don&apos;t.
          </h2>
          <p className="text-gray-500 mt-5 text-lg max-w-2xl mx-auto">
            A carefully crafted suite of tools designed specifically for modern school administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[260px]">
          
          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white inset-ring-1 inset-ring-gray-200/60 p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div className="absolute top-0 right-0 size-72 bg-linear-to-bl from-primary/5 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />
            <div>
              <div className="size-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                <UserPlus className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-950">Add Student Records</h3>
              <p className="text-gray-500 mt-2 max-w-md leading-relaxed">
                Enter student details including name, class, and admission data seamlessly using our structured and validated forms.
              </p>
            </div>
          </div>

          <div className="md:col-span-1 group relative overflow-hidden rounded-3xl bg-white inset-ring-1 inset-ring-gray-200/60 p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="size-14 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 mb-6">
                <ShieldCheck className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-950">Bank-grade Security</h3>
              <p className="text-gray-500 mt-2 leading-relaxed">
                Your school&apos;s data is encrypted at rest and securely backed up.
              </p>
            </div>
          </div>

          <div className="md:col-span-1 group relative overflow-hidden rounded-3xl bg-gray-950 text-white inset-ring-1 inset-ring-white/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[16px_16px]" />
            <div className="relative z-10">
              <div className="size-14 flex items-center justify-center rounded-2xl bg-white/10 text-white mb-6 backdrop-blur-md">
                <Zap className="size-7" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-gray-400 mt-2 leading-relaxed">
                Built on modern edge infrastructure for instant load times.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-linear-to-br from-white to-gray-50 inset-ring-1 inset-ring-gray-200/60 p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 h-full">
              <div className="max-w-sm">
                <div className="size-14 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-6">
                  <FileDown className="size-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-950">Generate Certificates</h3>
                <p className="text-gray-500 mt-2 leading-relaxed">
                  Automatically format, print, and download PDF Transfer Certificates in seconds based on existing records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24 px-6 relative overflow-hidden m-4 md:m-8 rounded-4xl bg-gray-950 text-white inset-ring-1 inset-ring-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
            Ready to upgrade your school?
          </h2>
          <p className="text-gray-400 text-lg md:text-xl text-balance">
            Join hundreds of administrators who have automated their workflow and eliminated paperwork completely.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Button asChild size="lg" className="h-14 px-8 rounded-full text-base w-full sm:w-auto hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/signup">Get Started Now</Link>
            </Button>
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2 mt-2 sm:mt-0 sm:ml-4">
              <CheckCircle2 className="size-4" /> No credit card required
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}