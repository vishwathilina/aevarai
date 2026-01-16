import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Privacy = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-12 max-w-4xl">
                    <h1 className="font-serif text-4xl font-semibold mb-8">Privacy Policy</h1>

                    <div className="space-y-8 text-muted-foreground">
                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                            <p className="mb-3">We collect information you provide directly to us, including:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Name, email address, and contact information</li>
                                <li>Account credentials</li>
                                <li>Payment and billing information</li>
                                <li>Shipping addresses</li>
                                <li>Transaction history and bidding activity</li>
                                <li>Communications with us or other users</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                            <p className="mb-3">We use the information we collect to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Process transactions and send related information</li>
                                <li>Send you technical notices and support messages</li>
                                <li>Respond to your comments and questions</li>
                                <li>Prevent fraudulent transactions and monitor against theft</li>
                                <li>Provide and improve our services</li>
                                <li>Send promotional communications (with your consent)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">3. Information Sharing</h2>
                            <p className="mb-3">We may share your information with:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Other users as necessary to complete transactions</li>
                                <li>Service providers who assist in our operations</li>
                                <li>Payment processors for transaction processing</li>
                                <li>Law enforcement when required by law</li>
                            </ul>
                            <p className="mt-3">We do not sell your personal information to third parties.</p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal
                                information against unauthorized access, alteration, disclosure, or destruction. However,
                                no method of transmission over the Internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">5. Cookies and Tracking</h2>
                            <p>
                                We use cookies and similar technologies to collect information about your browsing activities.
                                You can control cookies through your browser settings. Disabling cookies may limit your ability
                                to use some features of our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
                            <p className="mb-3">You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Access your personal information</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Opt out of marketing communications</li>
                                <li>Export your data in a portable format</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">7. Data Retention</h2>
                            <p>
                                We retain your personal information for as long as necessary to fulfill the purposes for which
                                it was collected, comply with legal obligations, resolve disputes, and enforce our agreements.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
                            <p>
                                Our services are not intended for individuals under 18 years of age. We do not knowingly
                                collect personal information from children.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">9. Changes to This Policy</h2>
                            <p>
                                We may update this privacy policy from time to time. We will notify you of any changes by
                                posting the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy, please contact us at privacy@avarai.com
                                or through our Contact page.
                            </p>
                        </section>

                        <div className="pt-8 border-t text-sm">
                            <p>Last updated: January 2026</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Privacy;
