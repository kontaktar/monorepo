import "../index.css";
import { Auth } from "../components/Auth";
import { Header } from "../components/Header";

function App() {
  return (
    <Auth>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <h2 className="text-lg font-medium text-red-700">
                    Total Users
                  </h2>
                  <p className="mt-2 text-3xl font-bold">0</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h2 className="text-lg font-medium text-red-700">
                    Active Services
                  </h2>
                  <p className="mt-2 text-3xl font-bold">0</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h2 className="text-lg font-medium text-red-700">
                    Completed Orders
                  </h2>
                  <p className="mt-2 text-3xl font-bold">0</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h2 className="text-lg font-medium text-red-700">Revenue</h2>
                  <p className="mt-2 text-3xl font-bold">$0</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b">
                    <p className="text-sm text-gray-500">
                      No recent activity to display
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Auth>
  );
}

export default App;
