"use client";

import { Render, type Data } from "@measured/puck";
import { puckConfig } from "@/lib/puckConfig";

// Wraps Puck's <Render> so it can safely receive page content from a
// Server Component. puckConfig is imported directly here (not passed
// as a prop) because it contains functions, which can't cross the
// server->client boundary — only the plain JSON `data` can.

export default function PuckRenderer({ data }: { data: Data }) {
  return <Render config={puckConfig} data={data} />;
}