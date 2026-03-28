import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profile | SchoolOS",
  description: "Manage your profile, password, and active sessions",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <ProfileClient />
    </div>
  );
}