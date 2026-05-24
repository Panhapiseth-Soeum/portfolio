import { isConfigured } from "@/sanity/env";
import { StudioClient } from "./StudioClient";

export const dynamic = "force-dynamic";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] p-8">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold text-[#fafafa]">
            CMS Not Configured
          </h1>
          <p className="mt-4 text-[var(--text-secondary)]">
            Create a <code className="rounded bg-[var(--bg-card)] px-1.5 py-0.5 text-sm text-accent">.env.local</code> file with your Sanity project ID to enable the CMS.
          </p>
        </div>
      </div>
    );
  }

  return <StudioClient />;
}
