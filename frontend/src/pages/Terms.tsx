import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Terms = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-12 max-w-4xl">
                    <h1 className="font-serif text-4xl font-semibold mb-8">Terms of Service</h1>

                    <div className="space-y-8 text-muted-foreground">
                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using ඈvarai ("the Platform"), you accept and agree to be bound by the terms
                                and provisions of this agreement. If you do not agree to abide by these terms, please do not
                                use this service.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">2. User Accounts</h2>
                            <p className="mb-3">
                                To participate in auctions, you must create an account. You are responsible for:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Providing accurate and complete information during registration</li>
                                <li>Updating your information to keep it current</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">3. Auction Rules</h2>
                            <p className="mb-3">When participating in auctions on our platform:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>All bids are legally binding offers to purchase</li>
                                <li>You may not retract a bid once placed</li>
                                <li>The highest bidder at auction close is obligated to complete the purchase</li>
                                <li>Sellers must accurately describe items and disclose any defects</li>
                                <li>All items must pass our inspection process before listing</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">4. Fees and Payments</h2>
                            <p className="mb-3">
                                Our fee structure includes:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Commission fees on successful sales (charged to sellers)</li>
                                <li>Payment processing fees</li>
                                <li>All payments must be completed within 48 hours of winning an auction</li>
                                <li>We accept major credit cards and approved payment methods</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">5. Prohibited Items</h2>
                            <p className="mb-3">
                                The following items are prohibited from being listed on our platform:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Counterfeit or replica items</li>
                                <li>Stolen property</li>
                                <li>Items that violate intellectual property rights</li>
                                <li>Hazardous materials</li>
                                <li>Items prohibited by law</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">6. Dispute Resolution</h2>
                            <p>
                                In the event of a dispute between buyers and sellers, both parties agree to work in good faith
                                to resolve the issue. ඈvarai may mediate disputes but is not obligated to do so. Our decision
                                in any dispute shall be final and binding.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
                            <p>
                                ඈvarai acts as a platform connecting buyers and sellers. We do not take possession of items
                                and are not responsible for the quality, safety, or legality of items listed. We make no
                                warranties regarding the accuracy of listings or the ability of sellers to sell items or
                                buyers to pay for them.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">8. Account Termination</h2>
                            <p>
                                We reserve the right to suspend or terminate your account at any time for violations of these
                                terms, fraudulent activity, or any other reason at our sole discretion.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">9. Changes to Terms</h2>
                            <p>
                                We may modify these terms at any time. Continued use of the platform after changes constitutes
                                acceptance of the new terms. We will notify users of significant changes via email or platform
                                notification.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
                            <p>
                                For questions about these Terms of Service, please contact us through our Contact page or
                                email us at support@avarai.com.
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

export default Terms;
