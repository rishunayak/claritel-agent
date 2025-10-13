import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Sparkles } from "lucide-react";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 lg:flex lg:items-center lg:justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 h-72 w-72 animate-pulse rounded-full bg-white blur-3xl"></div>
          <div
            className="absolute right-20 bottom-20 h-96 w-96 animate-pulse rounded-full bg-white blur-3xl"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-16 text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">Claritel Agent</h1>
          </div>
          <h2 className="mb-4 text-5xl leading-tight font-bold">
            Welcome to the future of intelligent communication
          </h2>
          <p className="mb-8 text-xl text-purple-100">
            Experience seamless AI-powered conversations and productivity tools
            designed for modern teams.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Enterprise-grade security</h3>
                <p className="text-sm text-purple-100">
                  Your data is encrypted and protected
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Seamless integration</h3>
                <p className="text-sm text-purple-100">
                  Works with your favorite tools
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">24/7 support</h3>
                <p className="text-sm text-purple-100">
                  We're here whenever you need us
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Claritel Agent</h1>
          </div>

          {/* Clerk Auth Components - Centered */}
          <div className="flex justify-center">
            {isSignIn ? (
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-sm border border-gray-200 w-full",
                    footer: { display: "none" },
                    footerAction: { display: "none" },
                    footerActionLink: { display: "none" },
                  },
                }}
                routing="virtual"
                afterSignInUrl="/dashboard"
              />
            ) : (
              <SignUp
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-sm border border-gray-200 w-full",
                    footer: { display: "none" },
                    footerAction: { display: "none" },
                    footerActionLink: { display: "none" },
                  },
                }}
                routing="virtual"
                afterSignUpUrl="/dashboard"
              />
            )}
          </div>

          {/* Toggle between Sign In and Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignIn ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsSignIn(false)}
                    className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsSignIn(true)}
                    className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              🔒 Secured with enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
