"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LocationFormSchema,
  type LocationFormData,
} from "@/lib/validations/location";
import { createLocation, updateLocation } from "@/lib/action/location";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconMapPin } from "@tabler/icons-react";

interface LocationFormProps {
  defaultValues?: Partial<LocationFormData>;
  locationId?: string;
  onSuccess?: () => void;
  submitLabel?: string;
  showResetButton?: boolean;
}

export function LocationForm({
  defaultValues,
  locationId,
  onSuccess,
  submitLabel = "Add Location",
  showResetButton = true,
}: LocationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(LocationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      isDefault: false,
      notes: "",
      ...defaultValues,
    },
  });

  const onSubmit = (data: LocationFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();

        if (locationId) {
          formData.append("id", locationId);
        }

        formData.append("name", data.name);
        if (data.address) formData.append("address", data.address);
        formData.append("isDefault", String(data.isDefault || false));
        if (data.notes) formData.append("notes", data.notes);

        const result = locationId
          ? await updateLocation(formData)
          : await createLocation(formData);

        if (result?.success) {
          toast.success(result.message ?? "Location saved successfully");
          if (!locationId) {
            form.reset();
          }
          router.refresh();
          onSuccess?.();
        } else {
          if (result?.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                form.setError(field as keyof LocationFormData, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
          }
          toast.error(result?.message ?? "Failed to save location");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleReset = () => {
    form.reset();
    toast.info("Form cleared");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5" />
              Location Details
            </CardTitle>
            <CardDescription>
              Enter the warehouse or storage location information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Warehouse" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name for this location.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the physical address"
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Default Location
                    </FormLabel>
                    <FormDescription>
                      Set this as the default location for new stock.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this location..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? "Saving..." : submitLabel}
          </Button>
          {showResetButton && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={isPending}
              onClick={handleReset}
            >
              Clear form
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
