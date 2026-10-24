"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, GraduationCap, Award, Globe, DollarSign, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    educationLevel: "BACHELORS",
    fieldOfStudy: "Computer Science",
    gpa: "3.75",
    gpaScale: "4.0",
    graduationYear: "2025",
    countryOfOrigin: "India",
    currentCountry: "India",
    familyIncomeUsd: "25000",
    ieltsScore: "7.5",
    toeflScore: "",
    greScore: "320",
    workExperienceYears: "2",
    publicationsCount: "1",
    achievements: "Dean's Honor Roll, 1st place in University Hackathon",
    skills: "Machine Learning, Python, React, Cloud Computing",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setFormData({
            educationLevel: p.educationLevel || "BACHELORS",
            fieldOfStudy: p.fieldOfStudy || "",
            gpa: p.gpa !== null ? String(p.gpa) : "",
            gpaScale: p.gpaScale !== null ? String(p.gpaScale) : "4.0",
            graduationYear: p.graduationYear !== null ? String(p.graduationYear) : "",
            countryOfOrigin: p.countryOfOrigin || "",
            currentCountry: p.currentCountry || "",
            familyIncomeUsd: p.familyIncomeUsd !== null ? String(p.familyIncomeUsd) : "",
            ieltsScore: p.ieltsScore !== null ? String(p.ieltsScore) : "",
            toeflScore: p.toeflScore !== null ? String(p.toeflScore) : "",
            greScore: p.greScore !== null ? String(p.greScore) : "",
            workExperienceYears: p.workExperienceYears !== null ? String(p.workExperienceYears) : "0",
            publicationsCount: p.publicationsCount !== null ? String(p.publicationsCount) : "0",
            achievements: p.achievements || "",
            skills: Array.isArray(p.skills) ? p.skills.join(", ") : "",
          });
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        educationLevel: formData.educationLevel,
        fieldOfStudy: formData.fieldOfStudy,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        gpaScale: formData.gpaScale ? parseFloat(formData.gpaScale) : 4.0,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null,
        countryOfOrigin: formData.countryOfOrigin,
        currentCountry: formData.currentCountry,
        familyIncomeUsd: formData.familyIncomeUsd ? parseFloat(formData.familyIncomeUsd) : null,
        ieltsScore: formData.ieltsScore ? parseFloat(formData.ieltsScore) : null,
        toeflScore: formData.toeflScore ? parseFloat(formData.toeflScore) : null,
        greScore: formData.greScore ? parseInt(formData.greScore, 10) : null,
        workExperienceYears: formData.workExperienceYears ? parseFloat(formData.workExperienceYears) : 0,
        publicationsCount: formData.publicationsCount ? parseInt(formData.publicationsCount, 10) : 0,
        achievements: formData.achievements,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update profile");
      }

      toast.success("Profile saved successfully! AI matching criteria updated.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic & Eligibility Profile</h1>
        <p className="text-muted-foreground mt-1">
          ScholarAI uses your verified academic metrics to deterministically evaluate your scholarship eligibility.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Academic Qualifications</CardTitle>
            </div>
            <CardDescription>
              Your degree level, course of study, and grade point average.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="educationLevel">Current / Intended Degree Level</Label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="HIGH_SCHOOL">High School</option>
                <option value="BACHELORS">Bachelor's Degree</option>
                <option value="MASTERS">Master's Degree</option>
                <option value="PHD">PhD / Doctorate</option>
                <option value="POSTDOC">Postdoctoral</option>
              </select>
            </div>

            <div>
              <Label htmlFor="fieldOfStudy">Field of Study / Major</Label>
              <Input
                id="fieldOfStudy"
                name="fieldOfStudy"
                placeholder="e.g. Computer Science, Public Policy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="gpa">Cumulative GPA</Label>
              <Input
                id="gpa"
                name="gpa"
                type="number"
                step="0.01"
                placeholder="e.g. 3.8"
                value={formData.gpa}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="gpaScale">GPA Scale</Label>
              <Input
                id="gpaScale"
                name="gpaScale"
                type="number"
                step="0.1"
                placeholder="4.0"
                value={formData.gpaScale}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="graduationYear">Expected / Completed Graduation Year</Label>
              <Input
                id="graduationYear"
                name="graduationYear"
                type="number"
                placeholder="e.g. 2025"
                value={formData.graduationYear}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Citizenship & Location */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Citizenship & Residency</CardTitle>
            </div>
            <CardDescription>
              Scholarships strictly filter by nationality and country of residence.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="countryOfOrigin">Country of Citizenship</Label>
              <Input
                id="countryOfOrigin"
                name="countryOfOrigin"
                placeholder="e.g. India, Nigeria, Brazil"
                value={formData.countryOfOrigin}
                onChange={handleChange}
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="currentCountry">Current Country of Residence</Label>
              <Input
                id="currentCountry"
                name="currentCountry"
                placeholder="e.g. India, United States"
                value={formData.currentCountry}
                onChange={handleChange}
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="familyIncomeUsd">Annual Household Income (USD equivalent)</Label>
              <Input
                id="familyIncomeUsd"
                name="familyIncomeUsd"
                type="number"
                placeholder="e.g. 25000"
                value={formData.familyIncomeUsd}
                onChange={handleChange}
                className="mt-1.5"
              />
              <span className="text-xs text-muted-foreground mt-1 block">
                Required for need-based scholarships.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Standardized Tests & Experience */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Standardized Scores & Research</CardTitle>
            </div>
            <CardDescription>
              Language certifications, graduate tests, and published works.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="ieltsScore">IELTS Band Score (0-9)</Label>
              <Input
                id="ieltsScore"
                name="ieltsScore"
                type="number"
                step="0.5"
                placeholder="e.g. 7.5"
                value={formData.ieltsScore}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="toeflScore">TOEFL iBT Score (0-120)</Label>
              <Input
                id="toeflScore"
                name="toeflScore"
                type="number"
                placeholder="e.g. 102"
                value={formData.toeflScore}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="greScore">GRE Total Score (260-340)</Label>
              <Input
                id="greScore"
                name="greScore"
                type="number"
                placeholder="e.g. 325"
                value={formData.greScore}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="workExperienceYears">Work Experience (Years)</Label>
              <Input
                id="workExperienceYears"
                name="workExperienceYears"
                type="number"
                step="0.5"
                placeholder="e.g. 2.5"
                value={formData.workExperienceYears}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="publicationsCount">Research Papers / Publications</Label>
              <Input
                id="publicationsCount"
                name="publicationsCount"
                type="number"
                placeholder="0"
                value={formData.publicationsCount}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills & Achievements */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Skills & Extracurricular Highlights</CardTitle>
            </div>
            <CardDescription>
              Comma-separated skills and notable academic or community achievements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="skills">Key Skills (comma separated)</Label>
              <Input
                id="skills"
                name="skills"
                placeholder="Machine Learning, Python, Public Speaking, Leadership"
                value={formData.skills}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="achievements">Notable Honors, Awards & Leadership</Label>
              <textarea
                id="achievements"
                name="achievements"
                rows={3}
                placeholder="Detail any awards, leadership roles, or community impact..."
                value={formData.achievements}
                onChange={handleChange}
                className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Saving Profile..." : "Save Profile & Update Matching"}
          </Button>
        </div>
      </form>
    </div>
  );
}
