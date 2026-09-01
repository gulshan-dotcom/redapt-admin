import { Suspense } from "react";
import RedirectClient from "./RedirectClient";

export default function RedirectPage() {
  return (
    <Suspense fallback={<div>Redirecting...</div>}>
      <RedirectClient />
    </Suspense>
  );
}