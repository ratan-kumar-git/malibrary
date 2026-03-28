"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import ProfileHeroCard from "@/components/profile/ProfileHeroCard";
import ActiveSessionsCard from "@/components/profile/ActiveSessionsCard";
import { toast } from "sonner";
import ProfilePageSkeleton from "@/components/skelton/ProfilePageSkeleton";

export default function ProfileClient() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
  });

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (isPending) return;

    if (!data?.user) {
      toast.error("Please sign in.");
      router.replace("/login");
    }
  }, [data, isPending, router]);

  /* ---------- Password Change ---------- */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.current.trim()) {
      toast.error("Please enter your current password");
      return;
    }
    if (!passwordData.new.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setIsUpdatingPassword(true);

    const { error } = await authClient.changePassword({
      currentPassword: passwordData.current,
      newPassword: passwordData.new,
      revokeOtherSessions: true,
    });

    setIsUpdatingPassword(false);

    if (error) {
      toast.error(error.message || "Update failed");
      return;
    }

    toast.success("Password updated. Other sessions revoked.");
    setPasswordData({ current: "", new: "" });
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ProfilePageSkeleton />
      </div>
    );
  }

  if (!data?.user || !data.session) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 space-y-8 pt-24 lg:pt-30">

      {/* Profile Card */}
      <ProfileHeroCard
        name={data.user.name || "Admin"}
        email={data.user.email}
        emailVerified={data.user.emailVerified}
        role="Administrator" 
        createdAt={new Date(data.user.createdAt)}
        image={data.user.image}
      />

      {/* Password & Security */}
      <Card className="rounded-3xl bg-white inset-ring-1 inset-ring-gray-200/60 shadow-sm border-0 overflow-hidden">
        
        <div className="flex items-center gap-3 px-6 py-5 bg-gray-50/50 border-b border-gray-100">
          <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
            <Key className="size-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-950">Password & Security</h3>
            <p className="text-sm text-gray-500">
              Changing your password will revoke all other active sessions.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange}>
          <CardContent className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Current Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-xl bg-gray-50/50 inset-ring-1 inset-ring-gray-200 focus-visible:bg-white"
                value={passwordData.current}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                minLength={8}
                className="h-12 rounded-xl bg-gray-50/50 inset-ring-1 inset-ring-gray-200 focus-visible:bg-white"
                value={passwordData.new}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new: e.target.value })
                }
              />
              <p className="text-xs font-medium text-gray-500 pt-1">
                Minimum 8 characters required.
              </p>
            </div>
          </CardContent>

          <CardFooter className="border-t border-gray-100 bg-gray-50/30 px-6 py-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isUpdatingPassword}
              className="h-11 rounded-xl px-6 shadow-sm"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Active Sessions */}
      <ActiveSessionsCard currentSessionId={data.session.id} />
      
    </div>
  );
}