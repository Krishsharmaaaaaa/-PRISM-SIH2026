"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";

interface Result {
  displayName: string;
  lat: number;
  lng: number;
}

export function LocationSearch({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function search(q: string) {
    setQuery(q);
    if (q.trim().length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data: any = await api.get("/geocoding/search", { params: { q } });
      setResults(data.data);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-96">
      <div className="flex items-center gap-2 rounded border border-hairlineStrong bg-white px-3 h-10 shadow-panel">
        <Search size={16} className="text-stoneLight shrink-0" />
        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search a place, road, or landmark…"
          className="w-full text-sm outline-none placeholder:text-stoneLight"
        />
        {loading && <span className="text-xs text-stoneLight">…</span>}
      </div>

      {open && results.length > 0 && (
        <div className="absolute mt-1 w-full rounded border border-hairline bg-white shadow-float z-20 max-h-72 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(r.lat, r.lng);
                setQuery(r.displayName);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-2.5 text-sm hover:bg-surfaceSunken border-b border-hairline last:border-0"
            >
              {r.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
