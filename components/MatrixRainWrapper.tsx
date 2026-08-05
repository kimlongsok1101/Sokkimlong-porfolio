"use client";

import dynamic from "next/dynamic";

const MatrixRain = dynamic(() => import("./MatrixRain"), {
  ssr: false,
  loading: () => null,
});

export default function MatrixRainWrapper() {
  return <MatrixRain />;
}
