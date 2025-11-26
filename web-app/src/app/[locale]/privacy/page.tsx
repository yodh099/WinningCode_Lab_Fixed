'use client';

import { useTranslations } from 'next-intl';

/**
 * Privacy Policy Page
 * 
 * Comprehensive privacy policy tailored to Winning Code Lab's
 * architecture and data handling practices.
 */
export default function PrivacyPolicyPage() {
    const t = useTranslations();

    return (
        <div className="min-h-screen bg-background py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold font-heading mb-4">Privacy Policy</h1>
                        <p className="text-sm text-muted-foreground">
                            Effective Date: January 1, 2025
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Last Updated: January 1, 2025
                        </p>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
                        <h3 className="font-semibold text-primary mb-2">Legal Disclaimer</h3>
                        <p className="text-sm text-muted-foreground">
                            This Privacy Policy is provided for informational purposes and should be reviewed by a qualified attorney
                            in your jurisdiction to ensure compliance with applicable laws and regulations.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Welcome to Winning Code Lab ("we," "our," or "us"). We are committed to protecting your privacy
                                and handling your personal information with care and transparency. This Privacy Policy explains how
                                we collect, use, store, and protect your personal data when you use our platform and services.
                            </p>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                By using our website and services, you consent to the data practices described in this policy.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">2. Data Collection</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We collect the following types of personal information:
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Identity Information</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                When you create an account or interact with our platform, we collect:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Full name</li>
                                <li>Email address</li>
                                <li>User role (Client, Team Member, Administrator)</li>
                                <li>Account credentials (encrypted and stored via Supabase Authentication)</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                This information is stored in our <code className="text-sm bg-muted px-2 py-1 rounded">profiles</code> table,
                                which is securely linked to Supabase Auth.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Project Data</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                For authenticated clients, we collect and store:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Project names and descriptions</li>
                                <li>Project budgets and timelines</li>
                                <li>Project status and milestones</li>
                                <li>Custom project requirements and specifications</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                This data is stored in our <code className="text-sm bg-muted px-2 py-1 rounded">client_projects</code> table
                                and is protected by Row Level Security (RLS) policies.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Files and Documents</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Clients may upload proprietary documents, design files, and project assets through our secure file upload system.
                                These files are stored using Supabase Storage with the following security measures:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li><strong>Signed URLs:</strong> All files are accessed via time-limited, cryptographically signed URLs.
                                    Files are never publicly accessible.</li>
                                <li><strong>Access Control:</strong> Only authorized users (the client owner and assigned team members)
                                    can access uploaded files.</li>
                                <li><strong>Automated Validation:</strong> Files are scanned and validated to prevent malicious uploads.</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Communications</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Messages exchanged between clients and our team are stored in a secure <code className="text-sm bg-muted px-2 py-1 rounded">messages</code> table.
                                This includes:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Message content</li>
                                <li>Timestamps</li>
                                <li>Sender and recipient information</li>
                                <li>Message status (read/unread)</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">2.5 Analytics and Usage Data</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We collect non-personally identifiable information about how you use our platform, including:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Page views and navigation patterns</li>
                                <li>Browser type and version</li>
                                <li>Device information</li>
                                <li>IP address (for security purposes)</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">3. Security Measures</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We implement industry-standard security practices to protect your data:
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Row Level Security (RLS)</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Our database utilizes <strong>Row Level Security (RLS)</strong> policies to ensure that clients can only
                                access their own data. This means:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Clients cannot view other clients' projects, files, or messages</li>
                                <li>Database-level enforcement prevents unauthorized data access</li>
                                <li>Even in the event of application-level vulnerabilities, RLS provides an additional layer of protection</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Automated Input Validation</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We use automated <strong>Edge Functions</strong> to:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Validate and sanitize user inputs</li>
                                <li>Prevent spam submissions on contact forms</li>
                                <li>Detect and block malicious file uploads</li>
                                <li>Rate-limit requests to prevent abuse</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Encryption</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                All data is encrypted:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li><strong>In Transit:</strong> All communications use HTTPS/TLS encryption</li>
                                <li><strong>At Rest:</strong> Database and file storage are encrypted at rest</li>
                                <li><strong>Passwords:</strong> User passwords are hashed using industry-standard algorithms</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">4. Cookies and Tracking</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We use cookies and similar technologies for the following purposes:
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Authentication Cookies</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Essential cookies are used for session management and user authentication. These cookies:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Maintain your logged-in state</li>
                                <li>Protect against unauthorized access</li>
                                <li>Are strictly necessary for platform functionality</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Language Preference Cookies</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We store your language preference (English, French, Haitian Creole, or Spanish) to provide a personalized experience.
                                This cookie remembers your selection across sessions.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Managing Cookies</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                You can control cookies through your browser settings. However, disabling authentication cookies will prevent
                                you from accessing your client dashboard.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">5. Third-Party Service Providers</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We work with the following trusted third-party providers:
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Supabase (Backend Provider)</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Supabase provides our database, authentication, and storage infrastructure. They are SOC 2 Type II compliant
                                and implement industry-leading security practices. Data is stored in secure, geographically distributed data centers.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Vercel (Hosting Provider)</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Vercel hosts our frontend application and provides CDN services for fast, global content delivery.
                                They maintain strict security and uptime standards.
                            </p>

                            <p className="text-muted-foreground leading-relaxed mt-6">
                                Both providers are bound by strict data processing agreements and are prohibited from using your data for
                                their own purposes.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We retain your personal data only as long as necessary to:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Provide our services to you</li>
                                <li>Comply with legal obligations</li>
                                <li>Resolve disputes</li>
                                <li>Enforce our agreements</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                Upon account termination or deletion request, we will delete or anonymize your personal data within 30 days,
                                unless legal retention requirements apply.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Depending on your location, you may have the following rights:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                                <li><strong>Objection:</strong> Object to certain processing activities</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                To exercise these rights, please contact us at <a href="mailto:privacy@winningcode.dev" className="text-primary hover:underline">privacy@winningcode.dev</a>.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">8. International Data Transfers</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Your data may be transferred to and processed in countries other than your country of residence.
                                We ensure that such transfers comply with applicable data protection laws and that appropriate safeguards
                                are in place to protect your information.
                            </p>
                        </section>

                        {/* Section 9 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal
                                information from children. If you believe we have inadvertently collected such information,
                                please contact us immediately.
                            </p>
                        </section>

                        {/* Section 10 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of significant changes by:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Posting the updated policy on our website</li>
                                <li>Updating the "Last Updated" date</li>
                                <li>Sending email notifications for material changes (if you have an account)</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                Your continued use of our services after such changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        {/* Section 11 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="bg-muted/30 rounded-lg p-6 mt-4">
                                <p className="text-foreground"><strong>Winning Code Lab</strong></p>
                                <p className="text-muted-foreground mt-2">Email: <a href="mailto:privacy@winningcode.dev" className="text-primary hover:underline">privacy@winningcode.dev</a></p>
                                <p className="text-muted-foreground">General Inquiries: <a href="mailto:hello@winningcode.dev" className="text-primary hover:underline">hello@winningcode.dev</a></p>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
