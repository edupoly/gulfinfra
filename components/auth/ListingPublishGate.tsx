"use client";

import { useState, type ReactNode } from "react";
import { EmailAuthFlow } from "@/components/auth/EmailAuthFlow";

export function ListingPublishGate({
  email,
  children,
}: {
  email?: string | null;
  children: ReactNode;
}) {
  const [verified, setVerified] = useState(false);
  return (
    <div className="space-y-5 border-t border-slate-200 pt-6">
      {!verified && <EmailAuthFlow defaultEmail={email ?? ""} requireOtp onAuthenticated={() => setVerified(true)} />}
      {verified && children}
    </div>
  );
}

