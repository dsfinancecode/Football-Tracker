import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Football Tracker",
  description: "Track weekly football games",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-100 text-zinc-900 min-h-screen antialiased font-sans">
        {/* Global Navigation Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
              <svg 
                viewBox="0 0 60.601004 60.601004" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-8 h-8"
              >
                <path d="m 7.7580027,56.063003 c -1.77875,0 -3.22,-1.44125 -3.22,-3.21875 l 0,-45.0850003 c 0,-1.77875 1.44125,-3.22125 3.22,-3.22125 l 45.0850003,0 c 1.7775,0 3.22,1.4425 3.22,3.22125 l 0,45.0850003 c 0,1.7775 -1.4425,3.21875 -3.22,3.21875 l -45.0850003,0 z" fill="transparent" />
                <path d="m 27.393004,43.221752 c -1.76875,0 -3.20125,1.4325 -3.20125,3.2 0,1.7675 1.4325,3.2 3.20125,3.2 1.7675,0 3.2,-1.4325 3.2,-3.2 0,-1.7675 -1.4325,-3.2 -3.2,-3.2" fill="#ffffff" />
                <path d="m 23.994254,16.091751 c 1.60625,0 2.90875,-1.3025 2.90875,-2.90875 0,-1.60625 -1.3025,-2.90875 -2.90875,-2.90875 -1.60625,0 -2.9075,1.3025 -2.9075,2.90875 0,1.60625 1.30125,2.90875 2.9075,2.90875" fill="#ffffff" />
                <path d="m 35.148005,36.943002 c 0.13875,0.22375 0.30875,0.425 0.50625,0.595 l 4.59625,3.995 2.8225,-1.63 -4.36125,-5.48375 -7.3925,-14.5075 c 1.23375,-0.1675 2.48625,-0.255 3.73125,-0.255 2.4575,0 4.89625,0.3275 7.25125,0.9725 l 1.2475,-2.16125 c -3.7075,-1.48375 -7.7525,-2.3025 -11.99125,-2.3025 -4.33875,0 -8.47875,0.84375 -12.25875,2.395 -0.23375,0.09375 -0.43875,0.24375 -0.60125,0.43 -1.845,2.13875 -2.8925,4.87 -2.8925,7.9225 0,2.245 0.605,4.3475 1.66,6.15625 l 2.105,-0.81625 c -0.4575,-1.20625 -0.7075,-2.51125 -0.7075,-3.8775 0,-2.14 0.6175,-4.14 1.68125,-5.8275 l 9.185,15.895 8.16375,10.08125 3.26625,-0.87375 -6.62375,-10.0075 -2.67125,-5.4775 0.22875,-0.11125 3.055,4.88875" fill="#ffffff" />
              </svg>
              Thursday Football
            </Link>
          </div>
        </header>
        
        {/* Main Page Content */}
        <main>
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}