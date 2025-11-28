'use client';



/**
 * Terms of Service Page
 * 
 * Comprehensive terms of service tailored to Winning Code Lab's
 * platform functionality and user roles.
 */
export default function TermsOfServicePage() {


    return (
        <div className="min-h-screen bg-background py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold font-heading mb-4">Terms of Service</h1>
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
                            These Terms of Service are provided for informational purposes and should be reviewed by a qualified attorney
                            in your jurisdiction to ensure compliance with applicable laws and regulations.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Welcome to Winning Code Lab (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our website, platform,
                                and services (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
                                If you do not agree to these Terms, please do not use our Services.
                            </p>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                These Terms constitute a legally binding agreement between you and Winning Code Lab.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">2. User Roles and Definitions</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Our platform serves different types of users with varying levels of access:
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Visitors</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                &quot;Visitors&quot; are individuals who browse our public website, including:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Viewing our portfolio and case studies</li>
                                <li>Reading our blog content</li>
                                <li>Learning about our services</li>
                                <li>Submitting inquiries via the &quot;Just Ask&quot; contact form</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                Visitors do not require an account and have read-only access to public content.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Clients</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                &quot;Clients&quot; are authenticated users who have engaged our services and have access to:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Secure Client Dashboard</li>
                                <li>Project management and tracking tools</li>
                                <li>Messaging system for team communication</li>
                                <li>File upload and sharing capabilities</li>
                                <li>Project timeline and milestone views</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                Client accounts are created upon project engagement and require authentication.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Team Members</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                &quot;Team Members&quot; are internal Winning Code Lab staff with elevated privileges to manage client projects
                                and platform operations.
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">3. Account Security and Responsibility</h2>

                            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Account Credentials</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                If you create an account, you are responsible for:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li><strong>Maintaining Confidentiality:</strong> Keep your password and login credentials secure and confidential</li>
                                <li><strong>Unauthorized Access:</strong> Immediately notify us of any unauthorized access to your account</li>
                                <li><strong>Account Activity:</strong> You are responsible for all activities conducted under your account</li>
                                <li><strong>Accurate Information:</strong> Provide and maintain accurate, current information</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Account Sharing Prohibition</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                You are responsible for maintaining the confidentiality of your account credentials. You may not share your account credentials with any third party. Each user must have their own account.
                                Violations may result in immediate account suspension.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Security Best Practices</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We recommend:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Using strong, unique passwords</li>
                                <li>Enabling two-factor authentication if available</li>
                                <li>Logging out from shared or public devices</li>
                                <li>Regularly updating your password</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">4. Intellectual Property Rights</h2>

                            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Platform Ownership</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Winning Code Lab retains all rights, title, and interest in:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>The platform source code and architecture</li>
                                <li>Our proprietary tools and methodologies</li>
                                <li>The Winning Code Lab brand, logos, and trademarks</li>
                                <li>Platform design, user interface, and user experience</li>
                                <li>Internal documentation and processes</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                You may not copy, modify, distribute, or reverse-engineer any part of our platform without explicit written permission.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Client Data Ownership</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                <strong>Clients retain full ownership</strong> of:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Files and documents uploaded to the platform</li>
                                <li>Project-specific content and requirements</li>
                                <li>Proprietary business information shared with us</li>
                                <li>Deliverables created specifically for their projects (as outlined in service agreements)</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                We claim no ownership rights to Client Data. However, by uploading content, you grant us a limited
                                license to use, store, and process your data solely for the purpose of providing our services.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Portfolio and Marketing Rights</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Unless otherwise agreed in writing, we may use completed projects in our portfolio and marketing materials.
                                Clients may request confidentiality agreements for sensitive projects.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">5. Acceptable Use Policy</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                You agree to use our Services in compliance with all applicable laws and these Terms.
                                The following activities are strictly prohibited:
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Contact Form Abuse</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                You may not:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Spam or flood our &quot;Just Ask&quot; contact form with automated or repetitive submissions</li>
                                <li>Submit false, misleading, or fraudulent information</li>
                                <li>Use the form for purposes other than legitimate business inquiries</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                <em>Note: We employ automated Edge Functions to detect and prevent spam. Abusive behavior will result in IP blocking.</em>
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Malicious File Uploads</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                You may not upload:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Malware, viruses, or any malicious code</li>
                                <li>Files designed to compromise system security</li>
                                <li>Illegal, infringing, or prohibited content</li>
                                <li>Excessively large files intended to disrupt service</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                <em>Note: All uploaded files undergo automated validation and security scanning. Malicious uploads will result
                                    in immediate account suspension and potential legal action.</em>
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Unauthorized Access</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                You may not:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Attempt to access other users&apos; accounts or data</li>
                                <li>Bypass or circumvent security measures</li>
                                <li>Probe, scan, or test system vulnerabilities</li>
                                <li>Interfere with platform operations or availability</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Prohibited Content</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                You may not upload or transmit content that:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Violates any law or regulation</li>
                                <li>Infringes on intellectual property rights</li>
                                <li>Contains hate speech, harassment, or threats</li>
                                <li>Is defamatory, obscene, or otherwise objectionable</li>
                            </ul>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">6. Account Termination</h2>

                            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Termination by Us</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right to terminate or suspend access to our Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>You violate these Terms or our Acceptable Use Policy</li>
                                <li>You breach security protocols or attempt unauthorized access</li>
                                <li>Payment obligations are not met (for paid services)</li>
                                <li>We detect fraudulent or illegal activity</li>
                                <li>Required by law or legal process</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Termination by You</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                You may request account termination at any time by contacting us at
                                <a href="mailto:hello@winningcode.dev" className="text-primary hover:underline ml-1">hello@winningcode.dev</a>.
                                Upon termination:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Your access to the Client Dashboard will be revoked</li>
                                <li>Your data will be deleted or anonymized per our Privacy Policy</li>
                                <li>You may request an export of your data before deletion</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Effect of Termination</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Upon termination, all licenses and rights granted to you will immediately cease.
                                All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">7. Service Availability and Modifications</h2>

                            <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Service Availability</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                While we strive for maximum uptime, we do not guarantee uninterrupted or error-free service.
                                We may experience:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Scheduled maintenance windows</li>
                                <li>Emergency updates or patches</li>
                                <li>Technical difficulties beyond our control</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Service Modifications</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right to modify, suspend, or discontinue any aspect of our Services at any time,
                                with or without notice. We are not liable for any modification, suspension, or discontinuation.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WINNING CODE LAB SHALL NOT BE LIABLE FOR:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
                                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                                <li>Loss of profits, revenue, data, or business opportunities</li>
                                <li>Service interruptions or data loss</li>
                                <li>Third-party actions or content</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                Our total liability for any claim arising from these Terms or our Services shall not exceed
                                the amount you paid us in the twelve (12) months preceding the claim.
                            </p>
                        </section>

                        {/* Section 9 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">9. Indemnification</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You agree to indemnify, defend, and hold harmless Winning Code Lab, its officers, directors, employees,
                                and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Your use or misuse of our Services</li>
                                <li>Your violation of these Terms</li>
                                <li>Your violation of any third-party rights</li>
                                <li>Content you upload or transmit</li>
                            </ul>
                        </section>

                        {/* Section 10 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">10. Dispute Resolution</h2>

                            <h3 className="text-xl font-semibold mb-3 mt-6">10.1 Informal Resolution</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                In the event of a dispute, we encourage you to first contact us at
                                <a href="mailto:legal@winningcode.dev" className="text-primary hover:underline ml-1">legal@winningcode.dev</a>
                                to attempt an informal resolution.
                            </p>

                            <h3 className="text-xl font-semibold mb-3 mt-6">10.2 Governing Law</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction],
                                without regard to its conflict of law provisions.
                            </p>
                        </section>

                        {/* Section 11 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may update these Terms from time to time. We will notify users of material changes by:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                                <li>Posting the updated Terms on our website</li>
                                <li>Updating the &quot;Last Updated&quot; date</li>
                                <li>Sending email notifications to registered users (for significant changes)</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                Your continued use of our Services after changes take effect constitutes acceptance of the updated Terms.
                            </p>
                        </section>

                        {/* Section 12 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">12. Entire Agreement</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                These Terms, together with our Privacy Policy and any service-specific agreements, constitute the entire
                                agreement between you and Winning Code Lab regarding our Services.
                            </p>
                        </section>

                        {/* Section 13 */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">13. Contact Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For questions about these Terms of Service, please contact us:
                            </p>
                            <div className="bg-muted/30 rounded-lg p-6 mt-4">
                                <p className="text-foreground"><strong>Winning Code Lab</strong></p>
                                <p className="text-muted-foreground mt-2">Legal Inquiries: <a href="mailto:legal@winningcode.dev" className="text-primary hover:underline">legal@winningcode.dev</a></p>
                                <p className="text-muted-foreground">General Support: <a href="mailto:hello@winningcode.dev" className="text-primary hover:underline">hello@winningcode.dev</a></p>
                            </div>
                        </section>

                        {/* Acknowledgment */}
                        <section className="bg-muted/30 rounded-lg p-6 mt-8">
                            <p className="text-sm text-muted-foreground">
                                By using Winning Code Lab&apos;s Services, you acknowledge that you have read, understood,
                                and agree to be bound by these Terms of Service.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
