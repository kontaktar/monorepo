"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      {/* Background Spinner - shows when SignIn disappears during redirect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-700 rounded-full animate-spin"></div>
      </div>

      {/* SignIn Component - sits on top of spinner */}
      <div className="relative z-10">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          redirectUrl="/"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-red-700 hover:bg-red-800 text-sm normal-case",
              formButtonPrimaryLoading: "bg-red-700",
              spinner: "text-red-700",
              spinnerIcon: "text-red-700",
              rootBox: "shadow-md",
              card: "shadow-md bg-white",
            },
            layout: {
              shimmer: true,
            },
          }}
        />
      </div>
    </div>
  );
}
