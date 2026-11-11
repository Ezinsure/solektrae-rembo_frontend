"use client";

import { useQuery } from "@tanstack/react-query";

export type RwandaLocations = {
  provinces: Record<string, string>; 
  districts: [code: string, name: string, province: string][];
  sectors: Record<string, [code: string, name: string][]>; 
  cells: Record<string, [code: string, name: string][]>; 
  villages: Record<string, string[]>; 
};

export const useRwandaLocations = (enabled = true) =>
  useQuery({
    queryKey: ["rwanda-locations"],
    queryFn: async () => {
      const res = await fetch("/data/rwanda-locations.json");
      if (!res.ok) throw new Error("Could not load the list of places");
      return (await res.json()) as RwandaLocations;
    },
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });