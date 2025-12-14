"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCompany } from "@/lib/actions/company";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Mail,
  Globe,
  Coins,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Loader,
  Upload,
  X,
  Users,
  Briefcase,
  ImageIcon,
} from "lucide-react";
import {
  IconShoppingCart,
  IconBuildingFactory2,
  IconDeviceLaptop,
  IconBuildingHospital,
  IconToolsKitchen2,
  IconCar,
  IconBuildingSkyscraper,
  IconTruck,
  IconDeviceMobile,
  IconPlant2,
  IconShirt,
  IconDots,
} from "@tabler/icons-react";
import { Logo } from "@/components/landing/logo";
import { HeroBackground } from "@/components/landing/hero-background";
import ShimmerText from "@/components/kokonutui/shimmer-text";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { Icon } from "@tabler/icons-react";

// Industry options for selection
const industries = [
  { id: "retail", label: "Retail", icon: IconShoppingCart },
  { id: "manufacturing", label: "Manufacturing", icon: IconBuildingFactory2 },
  { id: "technology", label: "Technology", icon: IconDeviceLaptop },
  { id: "healthcare", label: "Healthcare", icon: IconBuildingHospital },
  { id: "food_beverage", label: "Food & Beverage", icon: IconToolsKitchen2 },
  { id: "automotive", label: "Automotive", icon: IconCar },
  { id: "construction", label: "Construction", icon: IconBuildingSkyscraper },
  { id: "logistics", label: "Logistics", icon: IconTruck },
  { id: "electronics", label: "Electronics", icon: IconDeviceMobile },
  { id: "agriculture", label: "Agriculture", icon: IconPlant2 },
  { id: "fashion", label: "Fashion", icon: IconShirt },
  { id: "other", label: "Other", icon: IconDots },
];

// Team size options
const teamSizes = [
  { id: "1", label: "Just me", description: "Solo entrepreneur" },
  { id: "2-5", label: "2-5", description: "Small team" },
  { id: "6-10", label: "6-10", description: "Growing team" },
  { id: "11-25", label: "11-25", description: "Medium business" },
  { id: "26-50", label: "26-50", description: "Large team" },
];

// Step configuration
const steps = [
  {
    id: 1,
    title: "Organization Details",
    description: "What's your business called?",
    icon: Building2,
  },
  {
    id: 2,
    title: "Brand Identity",
    description: "Upload your company logo",
    icon: ImageIcon,
  },
  {
    id: 3,
    title: "Industry",
    description: "What industry are you in?",
    icon: Briefcase,
  },
  {
    id: 4,
    title: "Team Size",
    description: "How big is your team?",
    icon: Users,
  },
  {
    id: 5,
    title: "Preferences",
    description: "Configure your settings",
    icon: Coins,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    industry: "",
    teamSize: "",
    email: "",
    website: "",
    currency: "USD",
  });

  // Logo preview state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle logo upload
  const handleLogoUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      updateFormData("logo", result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoUpload(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    updateFormData("logo", "");
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      setError("Business name is required");
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  async function onSubmit() {
    setError(null);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("website", formData.website);
    data.append("currency", formData.currency);
    data.append("logo", formData.logo);
    data.append("industry", formData.industry);
    data.append("teamSize", formData.teamSize);

    startTransition(async () => {
      const result = await createCompany(null, data);
      if (result?.message && result.message !== "success") {
        setError(result.message);
        toast.error(result.message);
      } else {
        toast.success("Welcome aboard! Your Inventory is ready to use.");
        setRedirecting(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    });
  }

  // Progress percentage for the animated bar
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div
      className={cn(
        "min-h-screen bg-background flex",
        redirecting && "overflow-hidden"
      )}
    >
      {/* Success Overlay */}
      <AnimatePresence>
        {redirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex flex-col items-center gap-4"
            >
              <Loader className="size-8 animate-spin text-primary" />
              <ShimmerText
                text="Setting up your workspace..."
                className="text-sm relative"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background p-12 flex-col justify-between relative overflow-hidden transition-colors">
        <div className="absolute inset-0 z-0 invert select-none pointer-events-none opacity-40">
          <HeroBackground />
        </div>

        <div className="relative z-10 pointer-events-none">
          <div className="flex items-center gap-3 mb-16">
            <div className="p-2 rounded-lg  backdrop-blur-md">
              <Logo className="text-background" />
            </div>
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-balance text-background">
              {currentStep === 1 && "Let's set up your inventory workspace"}
              {currentStep === 2 && "Add your brand identity"}
              {currentStep === 3 && "Tell us about your industry"}
              {currentStep === 4 && "How big is your team?"}
              {currentStep === 5 && "Almost there! Final touches"}
            </h1>
            <p className="text-lg text-background/70 max-w-md leading-relaxed">
              {currentStep === 1 &&
                "Give your organization a name to get started with powerful inventory management."}
              {currentStep === 2 &&
                "Upload your company logo to personalize your dashboard experience."}
              {currentStep === 3 &&
                "We'll customize recommendations based on your industry."}
              {currentStep === 4 &&
                "This helps us tailor features for your team size."}
              {currentStep === 5 &&
                "Set your preferences and contact info to complete setup."}
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-6 pointer-events-none">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-background/20 border-2 border-foreground flex items-center justify-center text-xs font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-medium text-background">
                Join 10,000+ warehouses
              </p>
              <p className="text-background/60">Optimized with Velos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-lg mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 mx-auto justify-center">
            <Logo />
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Step {currentStep} of {steps.length}
              </span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                        currentStep > step.id
                          ? "bg-primary text-primary-foreground"
                          : currentStep === step.id
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {currentStep > step.id ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <Check className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </motion.div>
                    <span
                      className={cn(
                        "text-xs mt-2 font-medium hidden sm:block text-center max-w-[80px]",
                        currentStep >= step.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-8 sm:w-12 h-0.5 mx-1 transition-colors duration-300",
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-muted-foreground">
                  {steps[currentStep - 1].description}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg mb-6 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  {error}
                </motion.div>
              )}

              {/* Step 1: Organization Name */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Organization Name{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        placeholder="Acme Corporation"
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This will be displayed across your dashboard
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Logo Upload */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div
                    className={cn(
                      "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50",
                      logoPreview && "border-solid border-primary/30"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("logo-input")?.click()
                    }
                  >
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />

                    {logoPreview ? (
                      <div className="flex flex-col items-center">
                        <div className="relative group">
                          <Image
                            src={logoPreview}
                            alt="Company logo preview"
                            width={120}
                            height={120}
                            className="size-28 object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLogo();
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Upload className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">
                          Drop your logo here, or{" "}
                          <span className="text-primary">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, or SVG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => nextStep()}
                  >
                    Skip for now
                  </Button>
                </div>
              )}

              {/* Step 3: Industry Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {industries.map((industry) => {
                      const isSelected = formData.industry === industry.id;
                      return (
                        <motion.button
                          key={industry.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            updateFormData("industry", industry.id)
                          }
                          className={cn(
                            "relative p-2.5 rounded-lg border transition-all duration-200 text-center",
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-muted hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          {/* Selection indicator */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1 right-1 size-4 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="size-2.5 text-primary-foreground" />
                            </motion.div>
                          )}
                          <industry.icon
                            className={cn(
                              "size-5 mx-auto mb-1",
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs font-medium block leading-tight",
                              isSelected && "text-primary"
                            )}
                          >
                            {industry.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => nextStep()}
                  >
                    Skip for now
                  </Button>
                </div>
              )}

              {/* Step 4: Team Size */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {teamSizes.map((size) => {
                      const isSelected = formData.teamSize === size.id;
                      return (
                        <motion.button
                          key={size.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateFormData("teamSize", size.id)}
                          className={cn(
                            "relative p-3 rounded-lg border transition-all duration-200 text-center",
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-muted hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1 right-1 size-4 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="size-2.5 text-primary-foreground" />
                            </motion.div>
                          )}
                          <Users
                            className={cn(
                              "size-5 mx-auto mb-1",
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                          <p
                            className={cn(
                              "font-semibold text-sm",
                              isSelected && "text-primary"
                            )}
                          >
                            {size.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {size.description}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => nextStep()}
                  >
                    Skip for now
                  </Button>
                </div>
              )}

              {/* Step 5: Preferences & Contact */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="currency" className="text-xs font-medium">
                        Default Currency
                      </Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) =>
                          updateFormData("currency", value)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Select currency" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">
                            🇺🇸 USD - US Dollar
                          </SelectItem>
                          <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                          <SelectItem value="GBP">
                            🇬🇧 GBP - British Pound
                          </SelectItem>
                          <SelectItem value="PHP">
                            🇵🇭 PHP - Philippine Peso
                          </SelectItem>
                          <SelectItem value="CAD">
                            🇨🇦 CAD - Canadian Dollar
                          </SelectItem>
                          <SelectItem value="AUD">
                            🇦🇺 AUD - Australian Dollar
                          </SelectItem>
                          <SelectItem value="JPY">
                            🇯🇵 JPY - Japanese Yen
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-medium">
                          Email{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              updateFormData("email", e.target.value)
                            }
                            placeholder="contact@acme.com"
                            className="pl-8 h-9 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="website"
                          className="text-xs font-medium"
                        >
                          Website{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) =>
                              updateFormData("website", e.target.value)
                            }
                            placeholder="https://acme.com"
                            className="pl-8 h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2 border">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-primary" />
                      <p className="text-xs font-medium">Review your setup</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Organization
                        </span>
                        <span className="font-medium truncate ml-2">
                          {formData.name || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency</span>
                        <span className="font-medium">{formData.currency}</span>
                      </div>
                      {formData.industry && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Industry
                          </span>
                          <span className="font-medium truncate ml-2">
                            {
                              industries.find((i) => i.id === formData.industry)
                                ?.label
                            }
                          </span>
                        </div>
                      )}
                      {formData.teamSize && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Team</span>
                          <span className="font-medium">
                            {
                              teamSizes.find((t) => t.id === formData.teamSize)
                                ?.label
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="h-12 px-6 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex-1 h-12 group"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isPending || redirecting}
                className="flex-1 h-12"
              >
                {isPending || redirecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Launch Workspace
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
