import { Search } from "lucide-react";

export const SearchInput = () => {
  // TODO: Add search functionality

  return (
    <form className="flex w-full max-w-xl">
      <input
        type="text"
        placeholder="Search"
        className="h-10 w-full rounded-l-full border border-gray-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-0"
      />
      {/* TODO: add remove search button */}
      <button
        type="submit"
        className="h-10 w-16 flex items-center justify-center rounded-r-full border border-gray-300 border-l-0 bg-gray-100 hover:bg-gray-200"
      >
        <Search size={18} className="text-gray-700" />
      </button>
    </form>
  );
};
