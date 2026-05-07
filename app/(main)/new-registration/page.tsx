import { Home } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Metadata } from "next";
import NewRegistrationContent from "./new-registration-content";

export const metadata: Metadata = {
  title: "New Registration",
  description:
    "Register as a new student to access our library resources and services",
};

function LoadingContent() {
  return (
    <Card className="bg-card rounded-2xl shadow-lg shadow-foreground/5 border border-border overflow-hidden p-6 md:p-8">
      <div className="animate-pulse">
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    </Card>
  );
}

export default function StudentRegisterPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-6xl mx-auto pb-10 px-4 md:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mt-24 mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">
                    <Home className="w-4 h-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary flex items-center gap-2">
                  Student Registration
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Main Content */}
        <Suspense fallback={<LoadingContent />}>
          <NewRegistrationContent />
        </Suspense>
      </div>
    </div>
  );
}
