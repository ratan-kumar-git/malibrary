"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        studentId: "",
        message: "",
      });
      setIsSubmitted(false);
    }, 3000);
  };

  const shiftSchedule = [
    {
      shift: "Morning Shift",
      time: "6:00 AM - 12:00 PM",
      days: "Monday - Sunday",
    },
    {
      shift: "Afternoon Shift",
      time: "12:00 PM - 6:00 PM",
      days: "Monday - Sunday",
    },
    {
      shift: "Evening Shift",
      time: "6:00 PM - 10:00 PM",
      days: "Monday - Sunday",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-950">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-20">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-150 lg:size-200 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-balance bg-linear-to-b from-gray-950 to-gray-600 bg-clip-text text-transparent mb-6">
            Get in Touch
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Have questions about registration, shift schedules, or our
            facilities? We&apos;re here to help!
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-200/60 p-8 md:p-12 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-950 mb-8">
                Send us a Message
              </h2>

              {isSubmitted && (
                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-emerald-700 font-medium">
                    ✓ Thank you! Your message has been received. We&apos;ll get
                    back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-950"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-950"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="studentId"
                    className="text-sm font-medium text-gray-950"
                  >
                    Student ID (Optional)
                  </Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="Your student ID if applicable"
                    className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-950"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    required
                    rows={6}
                    className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-lg h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-6">
            {/* Email */}
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="size-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Mail className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-950 mb-1">Email</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    We respond within 24 hours
                  </p>
                  <a
                    href="mailto:info@library.org"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    info@library.org
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="size-12 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                  <Phone className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-950 mb-1">Phone</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Mon - Fri, 8AM - 6PM
                  </p>
                  <a
                    href="tel:+1234567890"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="size-12 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                  <MapPin className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-950 mb-1">Visit Us</h3>
                  <p className="text-sm text-gray-600">
                    Main Building, Ground Floor
                    <br />
                    Education Complex
                    <br />
                    City, State 12345
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-950 mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <Link
                  href="#"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path d="M576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 440 146.7 540.8 258.2 568.5L258.2 398.2L205.4 398.2L205.4 320L258.2 320L258.2 286.3C258.2 199.2 297.6 158.8 383.2 158.8C399.4 158.8 427.4 162 438.9 165.2L438.9 236C432.9 235.4 422.4 235 409.3 235C367.3 235 351.1 250.9 351.1 292.2L351.1 320L434.7 320L420.3 398.2L351 398.2L351 574.1C477.8 558.8 576 450.9 576 320z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHIFT SCHEDULE */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-950 mb-4">
              Our Shift Schedule
            </h2>
            <p className="text-gray-600 text-lg">
              Open 6 AM - 10 PM, 7 days a week
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shiftSchedule.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow text-center"
              >
                <Clock className="size-8 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold text-gray-950 mb-2">
                  {item.shift}
                </h3>
                <p className="text-lg font-semibold text-primary mb-2">
                  {item.time}
                </p>
                <p className="text-sm text-gray-600">{item.days}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-950 mb-4">
            Quick FAQ
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How do I book a seat?",
              a: "Visit our website, create an account, select your preferred shift, and book your seat instantly.",
            },
            {
              q: "Can I change my shift after booking?",
              a: "Yes, you can modify your booking up to 24 hours before your scheduled shift.",
            },
            {
              q: "What documents do I need to register?",
              a: "You'll need your student ID and a valid email address. That's it!",
            },
            {
              q: "Are there any membership fees?",
              a: "No additional fees. Just register and start booking. All seats are free for registered students.",
            },
            {
              q: "Is there WiFi available?",
              a: "Yes! High-speed WiFi is available throughout all floors for seamless connectivity.",
            },
          ].map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <summary className="flex justify-between items-center font-semibold text-gray-950 select-none">
                {item.q}
                <span className="ml-4 text-primary group-open:rotate-180 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-4 text-gray-600 text-sm">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 relative overflow-hidden m-4 md:m-8 rounded-4xl bg-gray-950 text-white inset-ring-1 inset-ring-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-transparent opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
            Ready to join us?
          </h2>
          <p className="text-gray-400 text-lg md:text-xl text-balance">
            Registration is quick and easy. Start booking your seats today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 rounded-full text-base w-full sm:w-auto hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/signup">Register Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 rounded-full text-base w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
