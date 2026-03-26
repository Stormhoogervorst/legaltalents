"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function NavbarPublic() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-extrabold italic text-primary text-xl">
            Legal Talents.
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/vacancies" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Vacatures
            </Link>
            <Link href="/firms" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Kantoren
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Link
              href="/register"
              className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Kantoor aanmelden
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu openen"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link
            href="/vacatures"
            className="block text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Vacatures
          </Link>
          <Link
            href="/kantoren"
            className="block text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Kantoren
          </Link>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-block bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Kantoor aanmelden
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
