import { useClerk, useUser } from "@clerk/clerk-react";

export function Header() {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg font-bold text-red-700">
                Kontaktar Admin
              </span>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="#"
                className="border-red-700 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Users
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Services
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Orders
              </a>
            </nav>
          </div>
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </span>
                <button
                  onClick={() => signOut()}
                  className="ml-2 px-3 py-1 border border-red-200 rounded-md text-sm font-medium text-gray-700 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
