import { useState } from "react";
import {
  SignIn,
  SignUp,
  useClerk,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";

type AuthTabType = "signIn" | "signUp";

interface AuthProps {
  children: React.ReactNode;
}

export function Auth({ children }: AuthProps) {
  const [tab, setTab] = useState<AuthTabType>("signIn");
  const { signOut } = useClerk();

  // Custom appearance for the Clerk components
  const appearance = {
    elements: {
      formButtonPrimary: "bg-red-700 hover:bg-red-800 text-white",
      formFieldInput: "border-gray-300 focus:ring-red-700 focus:border-red-700",
      card: "shadow-xl",
      headerTitle: "text-xl font-bold",
      headerSubtitle: "text-gray-600",
    },
  };

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Kontaktar Admin
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to access the admin dashboard
              </p>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-2 text-sm font-medium text-center ${
                  tab === "signIn"
                    ? "text-red-700 border-b-2 border-red-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setTab("signIn")}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium text-center ${
                  tab === "signUp"
                    ? "text-red-700 border-b-2 border-red-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setTab("signUp")}
              >
                Sign Up
              </button>
            </div>

            <div className="mt-8">
              {tab === "signIn" ? (
                <SignIn
                  appearance={appearance}
                  signUpUrl="#sign-up"
                  afterSignInUrl="/"
                />
              ) : (
                <SignUp
                  appearance={appearance}
                  signInUrl="#sign-in"
                  afterSignUpUrl="/"
                />
              )}
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
