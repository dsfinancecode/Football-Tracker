import { login } from "@/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-start pt-24 justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Admin Login</h2>
        </div>
        
        <form className="space-y-6" action={login}>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              id="email"
              name="email"
              type="email"
              required
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              id="password"
              name="password"
              type="password"
              required
              suppressHydrationWarning
            />
          </div>
          
          {params?.error && (
            <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">
              {params.error}
            </div>
          )}
          
          <button
            className="w-full rounded-lg bg-blue-600 p-2.5 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
            type="submit"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}