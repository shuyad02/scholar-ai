"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  country: z.string().min(2, "Country is required"),
  degree: z.string().min(1, "Degree level is required"),
  university: z.string().optional(),
  cgpa: z.string().optional(),
  graduationYear: z.string().optional(),
  ieltsScore: z.string().optional(),
  toeflScore: z.string().optional(),
});

export default function OnboardingForm({ 
  userId, 
  dbUserId 
}: { 
  userId: string, 
  dbUserId?: string 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "",
      degree: "",
      university: "",
      cgpa: "",
      graduationYear: "",
      ieltsScore: "",
      toeflScore: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, userId, dbUserId }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      toast.success("Profile saved! 🎉", {
        description: "Your academic profile has been set up successfully.",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of Citizenship</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. India, Nigeria, Brazil" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Degree Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BACHELOR">Bachelor's</SelectItem>
                    <SelectItem value="MASTER">Master's</SelectItem>
                    <SelectItem value="PHD">PhD</SelectItem>
                    <SelectItem value="POSTDOC">PostDoc</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current/Previous University</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cgpa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CGPA (out of 4.0 or equivalent)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ieltsScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IELTS Score</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" max="9" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toeflScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TOEFL Score</FormLabel>
                <FormControl>
                  <Input type="number" max="120" placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile & Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
