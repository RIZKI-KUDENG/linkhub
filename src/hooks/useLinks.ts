"use client";

import { useEffect, useState } from "react";
import { Link } from "@prisma/client";



export default function useLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/link");
      if(!res.ok){
        if(res.status === 401){
          return;
        }
        throw new Error(`Error fetching links: ${res.statusText}`);
      }
      const data: Link[] = await res.json();
      if (!Array.isArray(data)) {
        console.warn("Data links bukan array:", data);
        return;
      }
      const normalized = data.map((d, i) => ({ ...d, sortOrder: typeof d.sortOrder === "number" ? d.sortOrder : i }));
      normalized.sort((a, b) => a.sortOrder - b.sortOrder);
      setLinks(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  return { links, setLinks, loading, refetch: fetchLinks };
}
