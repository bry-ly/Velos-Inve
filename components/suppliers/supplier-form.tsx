"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  SupplierFormSchema,
  type SupplierFormData,
} from "@/lib/validations/supplier";
import { createSupplier, updateSupplier } from "@/lib/action/supplier";
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
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBuilding,
  IconNotes,
} from "@tabler/icons-react";

interface SupplierFormProps {
  defaultValues?: Partial<SupplierFormData>;
  supplierId?: string;
  onSuccess?: () => void;
  submitLabel?: string;
}

export function SupplierForm({
  defaultValues,
  supplierId,
  onSuccess,
  submitLabel = "Add Supplier",
}: SupplierFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      notes: "",
      ...defaultValues,
    },
  });

  const onSubmit = (data: SupplierFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();

        if (supplierId) {
          formData.append("id", supplierId);
        }

        Object.entries(data).forEach(([key, value]) => {
          if (value !== "" && value != null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        const result = supplierId
          ? await updateSupplier(formData)
          : await createSupplier(formData);

        if (result?.success) {
          toast.success(result.message ?? "Supplier saved successfully");

          if (!supplierId) {
            form.reset();
          }

          router.refresh();
          onSuccess?.();
        } else {
          if (result?.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                form.setError(field as keyof SupplierFormData, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
          }
          toast.error(result?.message ?? "Failed to save supplier");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Supplier Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <IconBuilding className="h-4 w-4" />
                Supplier Name *
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter supplier company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact Person */}
        <FormField
          control={form.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                Contact Person
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Primary contact name"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                The main person to contact at this supplier
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email & Phone Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <IconMail className="h-4 w-4" />
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="supplier@example.com"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <IconPhone className="h-4 w-4" />
                  Phone
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <IconMapPin className="h-4 w-4" />
                Address
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter supplier address"
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <IconNotes className="h-4 w-4" />
                Notes
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about this supplier..."
                  rows={4}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Payment terms, special agreements, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? (supplierId ? "Saving..." : "Adding...") : submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isPending}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
