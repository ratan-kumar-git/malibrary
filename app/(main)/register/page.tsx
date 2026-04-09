import { Suspense } from "react";
import StudentRegistrationForm from "@/components/student-registration/StudentRegistrationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking | MA Library",
  description: "Register as a student and book your study spot at MA Library",
};

function RegisterPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse" />
      <div className="space-y-4">
        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-40 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-6xl mx-auto px-6 pt-24 space-y-6">
        <Suspense fallback={<RegisterPageSkeleton />}>
          <StudentRegistrationForm />
        </Suspense>
      </div>
    </div>
  );
}
