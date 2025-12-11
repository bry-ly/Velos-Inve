"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CustomerFormSchema,
  type CustomerFormData,
} from "@/lib/validations/customer";
import { createCustomer, updateCustomer } from "@/lib/action/customer";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconUser, IconMail, IconPhone, IconMapPin } from "@tabler/icons-react";

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormData>;
  customerId?: string;
  onSuccess?: () => void;
  submitLabel?: string;
  showResetButton?: boolean;
}

export function CustomerForm({
  defaultValues,
  customerId,
  onSuccess,
  submitLabel = "Add Customer",
  showResetButton = true,
}: CustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(CustomerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      ...defaultValues,
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();

        if (customerId) {
          formData.append("id", customerId);
        }

        // Add all form fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== "" && value != null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        const result = customerId
          ? await updateCustomer(formData)
          : await createCustomer(formData);

        if (result?.success) {
          toast.success(result.message ?? "Customer saved successfully");

          if (!customerId) {
            form.reset();
          }

          router.refresh();
          onSuccess?.();
        } else {
          if (result?.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                form.setError(field as keyof CustomerFormData, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
          }
          toast.error(result?.message ?? "Failed to save customer");
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
              <IconUser className="h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Enter the customer&apos;s contact details and any relevant notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The customer&apos;s full name or business name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        placeholder="customer@example.com"
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
                        placeholder="+63 XXX XXX XXXX"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      placeholder="Enter customer address"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this customer..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Any additional information about this customer.
                  </FormDescription>
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
            {isPending ? (customerId ? "Saving..." : "Adding...") : submitLabel}
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
