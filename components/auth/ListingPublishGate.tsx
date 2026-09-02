"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EmailAuthFlow } from "@/components/auth/EmailAuthFlow";

export function ListingPublishGate({
  email,
  children,
}: {
  email?: string | null;
  children: ReactNode;
}) {
  const [verified, setVerified] = useState(false);
  const publishContainer = useRef<HTMLDivElement>(null);
  const submittedAfterVerification = useRef(false);

  useEffect(() => {
    if (!verified || submittedAfterVerification.current) return;

    const publishForm = publishContainer.current?.querySelector("form");
    if (!publishForm) return;

    submittedAfterVerification.current = true;
    publishForm.requestSubmit();
  }, [verified]);

  return (
    <div ref={publishContainer} className="space-y-5 border-t border-slate-200 pt-6">
      {!verified && <EmailAuthFlow defaultEmail={email ?? ""} requireOtp onAuthenticated={() => setVerified(true)} />}
      {verified && (
        <>
          <p role="status" className="rounded-xl bg-emerald-50 p-4 text-center font-bold text-emerald-700">
            ✓ Email verified. Submitting your listing for admin approval…
          </p>
          {children}
        </>
      )}
    </div>
  );
}
