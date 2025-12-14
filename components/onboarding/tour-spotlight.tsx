"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useOnboardingTour } from "./onboarding-tour-provider";
import { cn } from "@/lib/utils";

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: "top" | "bottom" | "left" | "right";
}

export function TourSpotlight() {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    currentStepData,
  } = useOnboardingTour();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    arrowPosition: "top",
  });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!currentStepData) return;

    const target = document.querySelector(currentStepData.target);
    if (!target) {
      console.warn(`Tour target not found: ${currentStepData.target}`);
      return;
    }

    const rect = target.getBoundingClientRect();
    setTargetRect(rect);

    // Calculate tooltip position based on preferred position
    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    let top = 0;
    let left = 0;
    let arrowPosition: "top" | "bottom" | "left" | "right" = "top";

    const position = currentStepData.position || "bottom";

    switch (position) {
      case "bottom":
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowPosition = "top";
        break;
      case "top":
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowPosition = "bottom";
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        arrowPosition = "left";
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        arrowPosition = "right";
        break;
    }

    // Ensure tooltip stays within viewport
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - tooltipWidth - padding)
    );
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - tooltipHeight - padding)
    );

    setTooltipPosition({ top, left, arrowPosition });
  }, [currentStepData]);

  useEffect(() => {
    if (isActive) {
      calculatePosition();
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition);

      return () => {
        window.removeEventListener("resize", calculatePosition);
        window.removeEventListener("scroll", calculatePosition);
      };
    }
  }, [isActive, currentStep, calculatePosition]);

  // Scroll target into view
  useEffect(() => {
    if (isActive && currentStepData) {
      const target = document.querySelector(currentStepData.target);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [isActive, currentStepData]);

  const isLastStep = currentStep === steps.length - 1;

  if (!isActive || !currentStepData) return null;

  return (
    <div className="fixed inset-0 z-100 pointer-events-none">
      {/* Overlay with spotlight cutout */}
      <AnimatePresence>
        {targetRect && (
          <>
            {/* Dark overlay using 4 divs to create spotlight effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-auto"
              onClick={skipTour}
            >
              {/* Top */}
              <div
                className="absolute bg-black/60 backdrop-blur-[1px]"
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: Math.max(0, targetRect.top - 8),
                }}
              />
              {/* Bottom */}
              <div
                className="absolute bg-black/60 backdrop-blur-[1px]"
                style={{
                  top: targetRect.bottom + 8,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              {/* Left */}
              <div
                className="absolute bg-black/60 backdrop-blur-[1px]"
                style={{
                  top: targetRect.top - 8,
                  left: 0,
                  width: Math.max(0, targetRect.left - 8),
                  height: targetRect.height + 16,
                }}
              />
              {/* Right */}
              <div
                className="absolute bg-black/60 backdrop-blur-[1px]"
                style={{
                  top: targetRect.top - 8,
                  left: targetRect.right + 8,
                  right: 0,
                  height: targetRect.height + 16,
                }}
              />
            </motion.div>

            {/* Spotlight border */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute rounded-lg border-2 border-primary shadow-[0_0_0_4px_rgba(var(--primary-rgb),0.2)]"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={tooltipRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute w-80 bg-card border border-border rounded-xl shadow-2xl p-5 pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          {/* Arrow indicator */}
          <div
            className={cn(
              "absolute w-3 h-3 bg-card border rotate-45",
              tooltipPosition.arrowPosition === "top" &&
                "-top-1.5 left-1/2 -translate-x-1/2 border-l border-t",
              tooltipPosition.arrowPosition === "bottom" &&
                "-bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b",
              tooltipPosition.arrowPosition === "left" &&
                "-left-1.5 top-1/2 -translate-y-1/2 border-l border-b",
              tooltipPosition.arrowPosition === "right" &&
                "-right-1.5 top-1/2 -translate-y-1/2 border-r border-t"
            )}
          />

          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>

          {/* Progress indicator */}
          <div className="flex gap-1 mb-3">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  idx <= currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Content */}
          <h3 className="font-semibold text-foreground mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {currentStepData.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-muted-foreground"
            >
              Skip tour
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={prevStep}>
                  <ArrowLeft className="size-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={isLastStep ? completeTour : nextStep}>
                {isLastStep ? (
                  <>
                    <CheckCircle className="size-4 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="size-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
