"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconCamera, IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/action/user";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    bio: "",
    company: "",
    location: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      toast.success("Image uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    toast.success("Image removed");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    startTransition(async () => {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("email", formData.email.trim());
      if (imagePreview !== user.image) {
        formDataToSend.append("image", imagePreview || "");
      }

      try {
        const result = await updateUserProfile(formDataToSend);
        if (result?.success) {
          toast.success(result.message ?? "Profile updated successfully");
          router.refresh();
        } else if (result?.errors) {
          const errorMessages = Object.values(result.errors).flat().join(", ");
          toast.error(result.message ?? "Validation failed", {
            description: errorMessages,
          });
        } else {
          toast.error(result?.message ?? "Failed to update profile.");
        }
      } catch (error) {
        toast.error("Failed to update profile.", {
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="name">Username</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your username"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            This is your public display name. It can be your real name or a
            pseudonym. You can only change this once every 30 days.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Select a verified email to display"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            You can manage verified email addresses in your email settings.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.bio}
            onChange={handleChange}
            placeholder="I own a computer."
          />
          <p className="text-[0.8rem] text-muted-foreground">
            You can @mention other users and organizations to link to them.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button onClick={handleSave} disabled={isPending}>
            Update profile
          </Button>
        </div>
      </div>
    </div>
  );
}
