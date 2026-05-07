"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Phone, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMemberId } from "@/lib/helper";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, {
    message: "Please enter a valid 10-digit phone number.",
  }),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender.",
  }),
  address: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentRegisterFormProps {
  libraryId: string;
}

export default function StudentRegisterForm({
  libraryId,
}: StudentRegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      gender: undefined,
      address: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/new-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          libraryId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Registration failed. Please try again.");
        return;
      }

      toast.success(
        "Registration successful! Your student ID is: " +
          formatMemberId(data.data.memberId),
      );
      form.reset();
      router.push("/registration-success")
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl bg-white/80 backdrop-blur-2xl inset-ring-1 inset-ring-gray-200/50 shadow-lg border-0">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-gray-950">
          Student Registration
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Fill in your details to register with our library. Your information
          will be kept secure and confidential.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Full Name *
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                      <Input
                        className="pl-10 h-12 rounded-xl bg-gray-50/50 inset-ring-1 inset-ring-gray-200 focus-visible:bg-white transition-colors text-gray-950"
                        placeholder="John Doe"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                      <Input
                        className="pl-10 h-12 rounded-xl bg-gray-50/50 inset-ring-1 inset-ring-gray-200 focus-visible:bg-white transition-colors text-gray-950"
                        placeholder="9876543210"
                        disabled={isLoading}
                        maxLength={10}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Gender *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-gray-50/50 inset-ring-1 inset-ring-gray-200 focus:bg-white transition-colors">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                      <Input
                        className="pl-10 h-12 rounded-xl bg-gray-50/50 inset-ring-1 inset-ring-gray-200 focus-visible:bg-white transition-colors text-gray-950"
                        placeholder="Your address (optional)"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white transition-colors mt-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By registering, you agree to our terms and conditions. Your data
              will be kept secure.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
