"use client";

import { UseFormReturn } from "react-hook-form";
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
import { Input } from "@/components/ui/input";

interface SupplySectionProps {
  form: UseFormReturn<ProductFormData>;
}

export function SupplySection({ form }: SupplySectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Supply & warranty</CardTitle>
        <CardDescription>
          Track vendor and service coverage information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier/vendor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Preferred supplier (optional)"
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
            name="warrantyMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warranty period (months)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Warranty period in months"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
