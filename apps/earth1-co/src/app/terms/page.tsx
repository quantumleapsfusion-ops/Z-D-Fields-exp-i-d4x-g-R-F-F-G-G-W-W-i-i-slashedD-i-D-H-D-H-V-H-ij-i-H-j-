import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for Earth 1 Coalescent.",
};

export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <div className="text-sm text-gray-600">
        Last updated: October 2, 2026
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Earth 1 Coalescent's platforms (earth1.co and
          e1-4.com), you agree to be bound by these Terms of Service. If you do
          not agree to these terms, please do not use our services.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2. Use License</h2>
        <p>
          We grant you a limited, non-exclusive, non-transferable license to
          use our platforms for personal, non-commercial purposes. You may not
          copy, modify, distribute, or transmit any content without our
          explicit permission.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3. e1-4.com Specific Terms</h2>
        <div className="space-y-4 ml-4">
          <div>
            <h3 className="font-bold text-lg">Voice Authentication</h3>
            <p>
              You authorize us to record your voice, derive a voiceprint for
              authentication, and store both securely. Voiceprints are used only
              for speaker verification and will not be used for any other
              purpose without your consent.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg">Age Requirement</h3>
            <p>
              e1-4.com is available only to users 13 and older. By using
              e1-4.com, you represent that you are at least 13 years old.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg">Illinois Restriction</h3>
            <p>
              Due to Illinois's Biometric Information Privacy Act (BIPA), e1-4.com
              is not available to residents of Illinois.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg">Voice Recordings</h3>
            <p>
              All voice recordings are your property. You grant us a license to
              store, display, and transmit them for the purpose of operating
              e1-4.com. You may delete any recording at any time, with a 30-day
              cancellation window for bulk deletion.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">4. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            Use our platforms for illegal, harmful, or abusive purposes
          </li>
          <li>
            Attempt to gain unauthorized access to our systems or user data
          </li>
          <li>
            Harass, threaten, or abuse other users
          </li>
          <li>
            Impersonate others or misrepresent your identity
          </li>
          <li>
            Engage in spam, phishing, or malicious activity
          </li>
          <li>
            Circumvent our terms or attempt to exploit our platforms
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">5. Content Ownership</h2>
        <p>
          You retain all ownership rights to your voice recordings and profile
          content. By uploading to e1-4.com, you grant us a license to store and
          transmit that content for platform operation. We do not claim
          ownership of your content.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">6. Disclaimer of Warranties</h2>
        <p>
          Our platforms are provided "as is" without warranties of any kind,
          express or implied. We do not warrant that our services will be
          uninterrupted, error-free, or secure. Use our platforms at your own
          risk.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Earth 1 Coalescent is not
          liable for any indirect, incidental, special, or consequential damages
          arising from your use of our platforms, even if we have been advised
          of the possibility of such damages.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">8. Account Termination</h2>
        <p>
          We reserve the right to terminate or suspend accounts that violate
          these Terms of Service. Upon termination, all associated data will be
          deleted within 24 hours.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">9. Changes to Terms</h2>
        <p>
          We may update these Terms of Service at any time. Continued use of our
          platforms constitutes acceptance of updated terms. We will notify you
          of material changes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">10. Contact</h2>
        <p>
          For questions about these Terms, contact:{" "}
          <a href="mailto:legal@earth1.co" className="text-blue-600 underline">
            legal@earth1.co
          </a>
        </p>
      </section>
    </div>
  );
}
