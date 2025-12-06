"use client";

import { UseFormReturn } from "react-hook-form";
import { Zap } from "lucide-react";
import { ProductFormData } from "@/lib/validations/product";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface InventorySectionProps {
  form: UseFormReturn<ProductFormData>;
}

export function InventorySection({ form }: InventorySectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Technical specifications</CardTitle>
        </div>
        <CardDescription>
          Capture technical data that helps your team validate compatibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="specs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed specs</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="List key specs or important details"
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
          name="compatibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compatibility notes</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Describe compatible devices or requirements"
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
  );
}
