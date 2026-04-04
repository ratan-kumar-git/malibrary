import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Armchair,
  Wifi,
  Users,
  Clock,
  ArrowRight, 
  CheckCircle2,
  ChevronRight,
  MapPin,
  BookOpen,
  Zap,
  Coffee,
  Image as ImageIcon
} from "lucide-react";

export default function Home() {
  const shifts = [
    { name: "Morning Shift", time: "6:00 AM - 12:00 PM", seats: "180/200", color: "from-orange-400 to-orange-600" },
    { name: "Afternoon Shift", time: "12:00 PM - 6:00 PM", seats: "195/200", color: "from-blue-400 to-blue-600" },
    { name: "Evening Shift", time: "6:00 PM - 10:00 PM", seats: "175/200", color: "from-purple-400 to-purple-600" },
    { name: "Full Day", time: "6:00 AM - 10:00 PM", seats: "190/200", color: "from-green-400 to-green-600" },
  ];

  const facilities = [
    { icon: Wifi, title: "High-Speed WiFi", desc: "Complete coverage across all floors" },
    { icon: Coffee, title: "Cafe & Refreshments", desc: "Coffee & snacks available" },
    { icon: Armchair, title: "Comfortable Seating", desc: "Modern furniture & ergonomic design" },
    { icon: Zap, title: "Power Outlets", desc: "Charging stations at every seat" },
    { icon: Users, title: "Quiet Study Areas", desc: "Dedicated silence zones" },
    { icon: BookOpen, title: "Book Collection", desc: "10,000+ titles & resources" },
  ];

  const galleryImages = [
    { title: "Main Hall", desc: "Spacious study area" },
    { title: "Reading Zone", desc: "Quiet study environment" },
    { title: "Computer Lab", desc: "Advanced computer facilities" },
    { title: "Discussion Room", desc: "Group study space" },
    { title: "Digital Library", desc: "E-resources & databases" },
    { title: "Lounge Area", desc: "Relaxation zone" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-950 selection:bg-primary/20 font-sans">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-36 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-150 lg:size-200 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <div 
            className="inline-flex items-center rounded-full inset-ring-1 inset-ring-primary/20 bg-primary/5 hover:bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 transition-colors cursor-default"
          >
            <MapPin className="size-4 mr-2" />
            Your Favorite Study Destination
            <ChevronRight className="ml-1 size-4 opacity-50" />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance bg-linear-to-b from-gray-950 to-gray-600 bg-clip-text text-transparent mb-6">
            Welcome to Our Library
          </h1>

          <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed text-balance mb-10">
            A modern, welcoming space designed for focused study, collaboration, and intellectual growth. Book your seat today and join thousands of students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto z-10">
            <Button asChild size="lg" className="h-14 px-8 rounded-full w-full sm:w-auto group text-base shadow-xl shadow-primary/20">
              <Link href="/signup">
                Book Your Seat Now
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full w-full sm:w-auto bg-white hover:bg-gray-50 text-base inset-ring-1 inset-ring-gray-200 border-0">
              <Link href="/about">Visit Us</Link>
            </Button>
          </div>
        </div>

        {/* HERO IMAGE PLACEHOLDER */}
        <div className="max-w-5xl mx-auto px-4 mt-20 relative z-10 perspective-[2000px]">
          <div className="rounded-4xl bg-linear-to-br from-primary/20 to-primary/5 backdrop-blur-2xl inset-ring-1 inset-ring-gray-200/50 shadow-2xl shadow-gray-200/50 overflow-hidden transform-gpu transition-transform duration-700 hover:rotate-x-2 h-96">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <ImageIcon className="size-16 mx-auto text-primary/50" />
                <p className="text-gray-500 font-medium">Stunning Library Interior</p>
                <p className="text-sm text-gray-400">Modern facilities for optimal studying</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white inset-ring-y-1 inset-ring-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div className="space-y-2">
              <h4 className="text-4xl font-extrabold text-gray-950">800+</h4>
              <p className="text-sm text-gray-500 font-medium">Total Seats</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl font-extrabold text-gray-950">4</h4>
              <p className="text-sm text-gray-500 font-medium">Shift Timings</p>
            </div>
            <div className="space-y-2 hidden md:block">
              <h4 className="text-4xl font-extrabold text-gray-950">5</h4>
              <p className="text-sm text-gray-500 font-medium">Floors</p>
            </div>
            <div className="space-y-2 hidden md:block">
              <h4 className="text-4xl font-extrabold text-gray-950">10K+</h4>
              <p className="text-sm text-gray-500 font-medium">Book Collection</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS / TRUST BAR */}
      <section className="bg-white inset-ring-y-1 inset-ring-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div className="space-y-2">
              <h4 className="text-4xl font-extrabold text-gray-950">90%</h4>
              <p className="text-sm text-gray-500 font-medium">Seat Utilization</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl font-extrabold text-gray-950">99.9%</h4>
              <p className="text-sm text-gray-500 font-medium">Uptime Guarantee</p>
            </div>
            <div className="space-y-2 hidden md:block">
              <h4 className="text-4xl font-extrabold text-gray-950">Real-time</h4>
              <p className="text-sm text-gray-500 font-medium">Availability Updates</p>
            </div>
            <div className="space-y-2 hidden md:block">
              <h4 className="text-4xl font-extrabold text-gray-950">&lt;1s</h4>
              <p className="text-sm text-gray-500 font-medium">Booking Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* SHIFT TIMINGS SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-950 text-balance">
            Our Shift Timings
          </h2>
          <p className="text-gray-500 mt-5 text-lg max-w-2xl mx-auto">
            Choose the shift that works best for your study schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shifts.map((shift, idx) => (
            <div 
              key={idx}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200/60 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute top-0 right-0 size-24 bg-linear-to-bl ${shift.color} opacity-10 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110`} />
              <div className="mb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-r ${shift.color} text-white mb-3`}>
                  <Clock className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-950">{shift.name}</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="size-4 opacity-60" />
                  {shift.time}
                </p>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-950">{shift.seats.split('/')[0]} Available</p>
                  <p className="text-xs text-gray-500">{shift.seats} seats</p>
                </div>
              </div>
              <Button asChild size="sm" className="w-full mt-4 rounded-lg">
                <Link href="/signup">Book Seat</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FACILITIES SECTION */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-950 mb-4">
              World-Class Facilities
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need for a productive study experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, idx) => {
              const Icon = facility.icon;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="size-14 flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Icon className="size-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-950 mb-2">{facility.title}</h3>
                  <p className="text-gray-600">{facility.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-950 text-balance mb-4">
            Explore Our Library
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            See what makes our library the perfect study destination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, idx) => (
            <div 
              key={idx}
              className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer h-64"
            >
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                <div className="text-center space-y-3">
                  <ImageIcon className="size-12 mx-auto text-primary/60 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-950">{image.title}</h3>
                    <p className="text-sm text-gray-600">{image.desc}</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24 px-6 relative overflow-hidden m-4 md:m-8 rounded-4xl bg-gray-950 text-white inset-ring-1 inset-ring-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
            Ready to start studying with us?
          </h2>
          <p className="text-gray-400 text-lg md:text-xl text-balance">
            Join hundreds of students who have made our library their study home. Book your seat today and enjoy a distraction-free learning environment.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Button asChild size="lg" className="h-14 px-8 rounded-full text-base w-full sm:w-auto hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/signup">Register & Book Now</Link>
            </Button>
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2 mt-2 sm:mt-0 sm:ml-4">
              <CheckCircle2 className="size-4" /> Online registration available 24/7
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}