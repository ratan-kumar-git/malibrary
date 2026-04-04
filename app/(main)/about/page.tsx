import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function AboutPage() {
  const milestones = [
    { year: "2015", title: "Founded", desc: "Started with a vision to provide quality study space" },
    { year: "2018", title: "Expansion", desc: "Added 3 new floors with modern facilities" },
    { year: "2021", title: "Digital", desc: "Launched online seat booking system" },
    { year: "2024", title: "Innovation", desc: "Introduced AI-powered seat management" },
  ];

  const floorInfo = [
    { floor: "Floor 1", seats: 180, focus: "Quiet Study Zone" },
    { floor: "Floor 2", seats: 200, focus: "Group Study Rooms" },
    { floor: "Floor 3", seats: 190, focus: "Computer Lab" },
    { floor: "Floor 4", seats: 160, focus: "Discussion Area" },
    { floor: "Floor 5", seats: 170, focus: "Reading Room" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-950">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-20">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-150 lg:size-200 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-balance bg-linear-to-b from-gray-950 to-gray-600 bg-clip-text text-transparent mb-6">
            About Our Library
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            A world-class learning facility dedicated to providing the best study environment for students and scholars.
          </p>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-950 mb-4">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Established in 2015, our library was founded on a simple but powerful mission: to provide students with a dedicated, comfortable, and technology-enabled space for focused learning and intellectual growth.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-950 mb-4">Our Mission</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                To create an inclusive, modern learning environment that supports academic excellence and fosters a community of engaged learners. We believe every student deserves access to quality study facilities.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-950">Why Choose Us?</h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="size-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-950">Modern Infrastructure</p>
                    <p className="text-sm text-gray-600">State-of-the-art facilities and equipment</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="size-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-950">24/7 Accessibility</p>
                    <p className="text-sm text-gray-600">Available 6 AM to 10 PM with flexible shifts</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="size-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-950">Diverse Spaces</p>
                    <p className="text-sm text-gray-600">Quiet zones, group rooms, and collaborative areas</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="size-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-950">Expert Staff</p>
                    <p className="text-sm text-gray-600">Dedicated team to assist your study needs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-linear-to-br from-primary/20 to-primary/5 border border-gray-200 p-12 shadow-xl">
              <div className="space-y-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">800+</div>
                  <p className="text-gray-600 font-medium">Study Seats Across 5 Floors</p>
                </div>
                <div className="border-t border-gray-200 pt-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                    <p className="text-gray-600 font-medium">Books & Digital Resources</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">8K+</div>
                    <p className="text-gray-600 font-medium">Active Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MILESTONES SECTION */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-950 mb-4">Our Journey</h2>
            <p className="text-gray-600 text-lg">Key milestones in our growth and development</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 text-2xl font-bold">
                  {milestone.year}
                </div>
                <h3 className="font-bold text-gray-950 mb-2">{milestone.title}</h3>
                <p className="text-sm text-gray-600">{milestone.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOORS SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-950 mb-4">Floor Information</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Explore our 5 unique floors, each designed for different study needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {floorInfo.map((info, idx) => (
            <div 
              key={idx}
              className="rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-white mb-3 mx-auto text-lg font-bold">
                {idx + 1}
              </div>
              <h3 className="font-bold text-gray-950 mb-1">{info.floor}</h3>
              <p className="text-sm text-gray-600 mb-3">{info.focus}</p>
              <div className="pt-3 border-t border-primary/20">
                <p className="text-lg font-bold text-primary">{info.seats}</p>
                <p className="text-xs text-gray-600">Seats Available</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHIFT TIMINGS */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-950 mb-4">Operational Hours</h2>
            <p className="text-gray-600 text-lg">Choose your preferred shift timing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <Clock className="size-8 text-orange-500 mb-3" />
              <h3 className="font-bold text-gray-950 mb-2">Morning Shift</h3>
              <p className="text-lg font-semibold text-primary mb-2">6:00 AM - 12:00 PM</p>
              <p className="text-sm text-gray-600">Best for early risers</p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <Clock className="size-8 text-blue-500 mb-3" />
              <h3 className="font-bold text-gray-950 mb-2">Afternoon Shift</h3>
              <p className="text-lg font-semibold text-primary mb-2">12:00 PM - 6:00 PM</p>
              <p className="text-sm text-gray-600">Most popular timing</p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <Clock className="size-8 text-purple-500 mb-3" />
              <h3 className="font-bold text-gray-950 mb-2">Evening Shift</h3>
              <p className="text-lg font-semibold text-primary mb-2">6:00 PM - 10:00 PM</p>
              <p className="text-sm text-gray-600">Perfect for evening studies</p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <Clock className="size-8 text-green-500 mb-3" />
              <h3 className="font-bold text-gray-950 mb-2">Full Day Access</h3>
              <p className="text-lg font-semibold text-primary mb-2">6:00 AM - 10:00 PM</p>
              <p className="text-sm text-gray-600">Complete access all day</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 relative overflow-hidden m-4 md:m-8 rounded-4xl bg-gray-950 text-white inset-ring-1 inset-ring-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-transparent opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
            Experience Excellence in Learning
          </h2>
          <p className="text-gray-400 text-lg md:text-xl text-balance">
            Join thousands of students who have found their ideal study environment with us. Your success is our success.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Button asChild size="lg" className="h-14 px-8 rounded-full text-base w-full sm:w-auto hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/signup">Register Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-base w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30">
              <Link href="/contact-us">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}