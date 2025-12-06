"use client";

import { UseFormReturn } from "react-hook-form";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { ProductFormData } from "@/lib/validations/product";
import { useImageUpload } from "@/hooks/use-image-upload";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface Tag {
  id: string;
  name: string;
}

interface MediaSectionProps {
  form: UseFormReturn<ProductFormData>;
  tags: Tag[];
}

export function MediaSection({ form, tags }: MediaSectionProps) {
  const {
    imagePreview,
    handleImageChange,
    handleRemoveImage,
    setInitialImage,
  } = useImageUpload();

  // Sync initial imageUrl from form to preview
  useEffect(() => {
    const currentImageUrl = form.getValues("imageUrl");
    if (currentImageUrl && !imagePreview) {
      setInitialImage(currentImageUrl);
    }
  }, [form, imagePreview, setInitialImage]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Media & additional notes</CardTitle>
        <CardDescription>
          Attach references and internal remarks for your team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative h-48 w-full overflow-hidden rounded-lg border">
                        <Image
                          src={imagePreview}
                          alt="Product preview"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          handleRemoveImage();
                          field.onChange("");
                        }}
                        className="mt-2"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="imageFile"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                        <Input
                          id="imageFile"
                          name="imageFile"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleImageChange(e);
                            // Read file and set to form field
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                field.onChange(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {tags.length > 0 && (
          <FormField
            control={form.control}
            name="tagIds"
            render={({ field }) => {
              const selectedTags = field.value || [];

              return (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <label
                          key={tag.id}
                          className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={(e) => {
                              const currentTags = field.value || [];
                              const newTags = e.target.checked
                                ? [...currentTags, tag.id]
                                : currentTags.filter((id) => id !== tag.id);
                              field.onChange(newTags);
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <span className="text-xs text-muted-foreground">
                    Select tags to categorize this product
                  </span>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal notes</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Share internal notes or handling tips"
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
