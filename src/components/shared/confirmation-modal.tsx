"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle2, ShoppingCart } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmationModalProps) {
  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white border-none",
    warning: "bg-amber-600 hover:bg-amber-700 text-white border-none",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white border-none",
    info: "bg-violet-600 hover:bg-violet-700 text-white border-none",
  };

  const Icon = variant === "danger" || variant === "warning" ? AlertCircle : CheckCircle2;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200 shadow-2xl rounded-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              variant === "danger" ? "bg-red-500/10 text-red-400" :
              variant === "warning" ? "bg-amber-500/10 text-amber-400" :
              "bg-violet-500/10 text-violet-400"
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-white leading-none">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-400 pt-2 text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-2">
          <AlertDialogCancel 
            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl h-11"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className={`${variantStyles[variant]} rounded-xl h-11 font-semibold transition-all px-6`}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
