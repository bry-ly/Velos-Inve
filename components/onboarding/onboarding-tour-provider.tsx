"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export interface TourStep {
  target: string; // CSS selector for the target element
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourContextValue {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  currentStepData: TourStep | null;
}

const OnboardingTourContext = createContext<OnboardingTourContextValue | null>(
  null
);

const TOUR_STORAGE_KEY = "velos_tour_completed";

// Dashboard tour steps configuration
const dashboardTourSteps: TourStep[] = [
  {
    target: "[data-tour='sidebar']",
    title: "Navigation Sidebar",
    description:
      "Access all your inventory features from here. Navigate to products, stock management, sales, and reports.",
    position: "right",
  },
  {
    target: "[data-tour='stats-cards']",
    title: "Dashboard Overview",
    description:
      "Get a quick snapshot of your inventory value, total products, and low stock alerts at a glance.",
    position: "bottom",
  },
  {
    target: "[data-tour='chart-area']",
    title: "Inventory Trends",
    description:
      "Track your inventory value over time with interactive charts. Filter by date range to analyze trends.",
    position: "top",
  },
  {
    target: "[data-tour='quick-stats']",
    title: "Quick Stats",
    description:
      "View key metrics like average unit price, total units, and category count.",
    position: "left",
  },
  {
    target: "[data-tour='user-menu']",
    title: "Your Account",
    description:
      "Access your profile settings, preferences, and sign out from here. Welcome to Velos!",
    position: "bottom",
  },
];

interface OnboardingTourProviderProps {
  children: ReactNode;
  autoStart?: boolean;
}

export function OnboardingTourProvider({
  children,
  autoStart = false,
}: OnboardingTourProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Check if tour was already completed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!completed && autoStart) {
        // Small delay to let the page render first
        const timer = setTimeout(() => {
          setIsActive(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
      setHasCheckedStorage(true);
    }
  }, [autoStart]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < dashboardTourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Tour complete
      setIsActive(false);
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  }, []);

  const currentStepData = isActive ? dashboardTourSteps[currentStep] : null;

  return (
    <OnboardingTourContext.Provider
      value={{
        isActive,
        currentStep,
        steps: dashboardTourSteps,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        currentStepData,
      }}
    >
      {children}
    </OnboardingTourContext.Provider>
  );
}

export function useOnboardingTour() {
  const context = useContext(OnboardingTourContext);
  if (!context) {
    throw new Error(
      "useOnboardingTour must be used within an OnboardingTourProvider"
    );
  }
  return context;
}

// Export a function to reset tour for testing
export function resetTour() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }
}
