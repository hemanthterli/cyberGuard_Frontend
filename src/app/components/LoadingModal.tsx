import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  steps: string[];
  isOpen: boolean;
}

export function LoadingModal({ steps, isOpen }: LoadingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }
    if (currentStep >= steps.length - 1) return;
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isOpen, currentStep, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center gap-6 min-w-[280px] max-w-sm w-full mx-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <div className="w-full space-y-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-300 ${
                i > currentStep ? "opacity-30" : ""
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  i < currentStep
                    ? "bg-green-100 text-green-600"
                    : i === currentStep
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < currentStep ? "✓" : i + 1}
              </div>
              <p
                className={`text-sm font-medium transition-colors duration-300 ${
                  i < currentStep
                    ? "text-gray-400 line-through"
                    : i === currentStep
                    ? "text-blue-700"
                    : "text-gray-300"
                }`}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
