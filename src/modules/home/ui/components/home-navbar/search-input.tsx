"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export const SearchInput = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <form className="flex w-full max-w-xl" onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-l-full border border-gray-300 bg-white px-4 pr-10  outline-none focus:border-blue-500 focus:ring-0"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!searchQuery.trim()}
        className={cn(
          "h-10 w-20 flex items-center justify-center rounded-r-full border border-gray-300 border-l-0 bg-gray-100 hover:bg-gray-200",
          !searchQuery.trim() && "cursor-not-allowed hover:bg-gray-100"
        )}
      >
        <Search
          size={18}
          className={cn(
            "text-gray-700",
            !searchQuery.trim() && "text-gray-400"
          )}
        />
      </button>
    </form>
  );
};
