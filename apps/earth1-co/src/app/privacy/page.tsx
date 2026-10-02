import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Earth 1 Coalescent protects your data.",
};

export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <div className="text-sm text-gray-600">
        Last updated: October 2, 2026
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Overview</h2>
        <p>
          Earth 1 Coalescent ("we," "us," "our," or "Company") operates both
          earth1.co (our knowledge and education platform) and e1-4.com (our
          voice-native social application). This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. Information We Collect</h2>
        <div className="space-y-4 ml-4">
          <div>
            <h3 className="font-bold text-lg">Voice & Voiceprints</h3>
            <p>
              On e1-4.com, we collect voice recordings and derive encrypted
              voiceprints for speaker identification and authentication. These
              voiceprints are stored separately from audio content.
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Voiceprints are never compared against external databases</li>
              <li>
                Voice recordings are encrypted at rest and in transit
              </li>
              <li>
                You authorize voice storage during sign-up with a spoken consent
                flow
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg">Profile Information</h3>
            <p>
              Username, profile picture, and avatar. Your profile is visible to
              other users.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg">Usage Data</h3>
            <p>
              Session duration, features accessed, and interaction logs. This
              data helps us improve the product and understand usage patterns.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2. Data Retention & Deletion</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong>Voiceprints:</strong> Destroyed immediately upon account
            deletion, opt-out, or 3 years of inactivity.
          </li>
          <li>
            <strong>Voice Recordings:</strong> Can be deleted individually or
            all at once with a 30-day cancellation window.
          </li>
          <li>
            <strong>Account Deletion:</strong> A hard delete removes all
            associated data within 24 hours.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3. California Residents (CCPA)</h2>
        <p>
          If you are a California resident, you have the right to request what
          personal information we hold, request deletion, and opt out of data
          sales (we do not sell data). Contact{" "}
          <a href="mailto:privacy@earth1.co" className="text-blue-600 underline">
            privacy@earth1.co
          </a>{" "}
          to exercise these rights.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">4. Illinois Residents (BIPA)</h2>
        <p>
          Illinois' Biometric Information Privacy Act (BIPA) requires explicit
          written consent before collecting voiceprints. By proceeding with
          e1-4.com voice sign-in, you provide this consent. However, e1-4.com
          is not available to residents of Illinois. If you are in Illinois,
          please do not use e1-4.com.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">5. Children</h2>
        <p>
          e1-4.com is not intended for users under 13. We do not knowingly
          collect personal information from children under 13. If we become aware
          that a child under 13 has created an account, we will delete it
          immediately.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">6. Contact Us</h2>
        <p>
          For privacy questions or concerns, contact:{" "}
          <a href="mailto:privacy@earth1.co" className="text-blue-600 underline">
            privacy@earth1.co
          </a>
        </p>
      </section>
    </div>
  );
}
