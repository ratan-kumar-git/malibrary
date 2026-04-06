import { StudentRegistrationForm } from "@/components/student-registration/StudentRegistrationForm";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Student Registration | MA Library",
  description: "Register as a student and book your seat at MA Library",
};

function RegistrationFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse" />
      <div className="h-96 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

export default function StudentRegistrationPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mt-24 mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Student Registration
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Fill in your details and book your seat at MA Library
          </p>
          <Link href="/seat-map">
            <Button variant="outline" className="gap-2 mb-4">
              <MapPin size={16} />
              View Seat Map First
            </Button>
          </Link>
        </div>

        <Suspense fallback={<RegistrationFormSkeleton />}>
          <StudentRegistrationForm />
        </Suspense>
      </div>
    </div>
  );
}
