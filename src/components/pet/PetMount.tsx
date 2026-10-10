"use client";

import dynamic from "next/dynamic";

// The pet is pure decoration: load it after the page, never on the server.
const Pet = dynamic(() => import("./Pet"), { ssr: false });

export default function PetMount() {
  return <Pet />;
}
