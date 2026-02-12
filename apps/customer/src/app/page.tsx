import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-serif font-bold text-gray-900"
            >
              <div className="w-10 h-10 bg-red-700 rounded flex items-center justify-center">
                <span className="text-white font-serif font-bold text-[2rem] leading-[0.8] flex items-center justify-center -mb-2">
                  K
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 py-2 text-sm font-medium rounded-md bg-red-700 text-white hover:bg-red-800 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight">
              Find the Perfect Service
              <span className="text-red-700"> for Your Needs</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Connect with skilled professionals in Iceland for any job, big or
              small. From plumbers to photographers, we&apos;ve got you covered.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What service are you looking for?"
                  className="w-full py-4 px-6 pr-32 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition shadow-sm"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-700 text-white px-8 py-2.5 rounded-full hover:bg-red-800 transition font-medium">
                  Search
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 flex justify-center gap-8 md:gap-16 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600 mt-1">Professionals</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600 mt-1">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600 mt-1">Jobs Done</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600">
              Explore the most requested services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Home Services",
                icon: "🏠",
                description: "Plumbers, electricians, cleaners",
                count: "120+ services",
              },
              {
                name: "Creative & Design",
                icon: "🎨",
                description: "Graphic design, photography, video",
                count: "85+ services",
              },
              {
                name: "Web & Tech",
                icon: "💻",
                description: "Web development, IT support, apps",
                count: "95+ services",
              },
              {
                name: "Events & Entertainment",
                icon: "🎉",
                description: "DJs, photographers, catering",
                count: "60+ services",
              },
              {
                name: "Business Services",
                icon: "💼",
                description: "Accounting, legal, consulting",
                count: "75+ services",
              },
              {
                name: "Automotive",
                icon: "🚗",
                description: "Mechanics, detailing, towing",
                count: "45+ services",
              },
            ].map((category) => (
              <div
                key={category.name}
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:shadow-lg transition-all cursor-pointer bg-white"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-700 transition">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {category.description}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {category.count}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button className="text-red-700 font-medium hover:text-red-800 transition">
              View all categories →
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-700">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-gray-600">
                Find the service you need from our extensive list of
                professionals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-700">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">
                Review profiles, ratings, and prices to find the perfect match
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-700">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get It Done</h3>
              <p className="text-gray-600">
                Book the service and get your job completed with confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-red-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Join thousands of satisfied customers finding great services every
              day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="px-8 py-3 bg-white text-red-700 rounded-md text-lg font-medium hover:bg-gray-100 transition"
              >
                Create an Account
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-3 bg-red-800 text-white rounded-md text-lg font-medium hover:bg-red-900 transition border-2 border-red-600"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Kontaktar</h3>
              <p className="text-sm">
                Connecting Iceland&apos;s best service providers with customers.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Browse services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Safety
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">
                For Professionals
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    List your service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Resources
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms & Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Kontaktar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
