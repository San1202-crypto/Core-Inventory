"use client";

import React from "react";
import Link from "next/link";

/**
 * Footer Component
 * Displays footer with copyright year and navigation links
 * Responsive design with mobile stacking
 * Matches navbar glassmorphic styling
 */
export default function Footer() {
  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  // Footer navigation links (showcase only, no actual pages)
  const footerLinks = [
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ];

  return (
    <footer className="w-full border-t border-foreground/10 bg-background text-foreground py-6">
      <div className="mx-auto w-full max-w-9xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Section - Copyright and Brand */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-[11px] font-black uppercase tracking-widest text-foreground">
            <span>
              Inventory System
            </span>
            <span className="hidden sm:inline opacity-20">•</span>
            <span className="opacity-40">© {currentYear} MS-CONTROL</span>
          </div>

          {/* Right Section - Navigation Links */}
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[11px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

