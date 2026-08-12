"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const filters = ["Shade", "Finish", "Concern"] as const;
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Top Rated"];

export function FilterToolbar({ productCount = 8 }: { productCount?: number }) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Featured");

  return (
    <div className="sticky top-20 z-40 border-y border-[#E9DDCF]/30 bg-surface py-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        {/* Left filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {filters.map((filter) => (
            <div key={filter} className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenFilter((current) => (current === filter ? null : filter))
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E9DDCF] bg-white px-4 py-2 text-xs font-medium tracking-wide text-svate-espresso transition-colors hover:border-svate-gold sm:text-sm"
              >
                {filter}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={1.5} />
              </button>
              {openFilter === filter && (
                <div className="absolute left-0 top-full z-50 mt-2 min-w-[140px] rounded-xl border border-[#E9DDCF] bg-white p-2 shadow-luxury">
                  <p className="px-2 py-1.5 text-xs text-svate-taupe">
                    All {filter.toLowerCase()}s
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: count + sort */}
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-xs text-svate-mocha sm:text-sm">
            Displaying {productCount} Products
          </p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E9DDCF] bg-white px-4 py-2 text-xs font-medium tracking-wide text-svate-espresso transition-colors hover:border-svate-gold sm:text-sm"
            >
              Sort By
              <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={1.5} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border border-[#E9DDCF] bg-white p-2 shadow-luxury">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSortBy(option);
                      setSortOpen(false);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-svate-beige/40 ${
                      sortBy === option
                        ? "font-medium text-svate-gold"
                        : "text-svate-espresso"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
