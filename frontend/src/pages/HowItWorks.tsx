import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Clock, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const HowItWorks = () => {
    const [expandedExample, setExpandedExample] = useState<number | null>(1);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16 md:py-24">
                    <div className="container text-center">
                        <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
                            How Proxy Bidding Works
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                            Never miss a bid again. Set your maximum amount and let our system bid for you automatically.
                        </p>
                    </div>
                </section>

                {/* What is Proxy Bidding */}
                <section className="py-16 border-b">
                    <div className="container max-w-4xl">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-serif text-2xl font-semibold mb-4">What is Proxy Bidding?</h2>
                                <p className="text-muted-foreground mb-4">
                                    Proxy bidding (also called automatic bidding) is a feature that allows you to set a <strong>maximum amount</strong> you're willing to pay for an item. The system will then automatically place bids on your behalf, bidding only the minimum necessary to stay ahead of other bidders.
                                </p>
                                <p className="text-muted-foreground">
                                    Your maximum amount is kept <strong>secret</strong>. Other bidders only see the current bid, not your limit. The system works like having a personal bidding agent who never sleeps and never misses a bid.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How the Algorithm Works */}
                <section className="py-16 bg-muted/30">
                    <div className="container max-w-4xl">
                        <h2 className="font-serif text-2xl font-semibold mb-8 text-center">How the Algorithm Works</h2>

                        <div className="space-y-6">
                            {/* Step 1 */}
                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                        1
                                    </div>
                                    <h3 className="font-semibold text-lg">You Set Your Maximum</h3>
                                </div>
                                <p className="text-muted-foreground ml-14">
                                    When you place a proxy bid, you enter the absolute maximum you're willing to pay. This amount must be higher than the current auction price. Your max is stored securely and never revealed to other bidders.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                        2
                                    </div>
                                    <h3 className="font-semibold text-lg">System Places Minimum Bid</h3>
                                </div>
                                <p className="text-muted-foreground ml-14">
                                    The system immediately places a bid at the <strong>minimum required amount</strong> (current price + minimum increment). It doesn't bid your full maximum unless necessary.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                        3
                                    </div>
                                    <h3 className="font-semibold text-lg">Automatic Outbidding</h3>
                                </div>
                                <p className="text-muted-foreground ml-14">
                                    When someone else places a bid, the system automatically responds on your behalf. It bids just enough to beat them (their bid + minimum increment), as long as it's within your maximum.
                                </p>
                            </div>

                            {/* Step 4 */}
                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                        4
                                    </div>
                                    <h3 className="font-semibold text-lg">Two Proxy Bids Compete</h3>
                                </div>
                                <p className="text-muted-foreground ml-14">
                                    When two users have proxy bids, the system instantly resolves the competition. The user with the <strong>higher maximum</strong> wins, with the price set to the loser's max + minimum increment (or the winner's max if it's lower).
                                </p>
                            </div>

                            {/* Step 5 */}
                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                        5
                                    </div>
                                    <h3 className="font-semibold text-lg">Notifications</h3>
                                </div>
                                <p className="text-muted-foreground ml-14">
                                    If you're outbid beyond your maximum, you'll receive a notification immediately. You can then decide to increase your proxy bid or let it go.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Example Scenarios */}
                <section className="py-16 border-b">
                    <div className="container max-w-4xl">
                        <h2 className="font-serif text-2xl font-semibold mb-8 text-center">Example Scenarios</h2>

                        <div className="space-y-4">
                            {/* Example 1 */}
                            <div className="bg-card rounded-xl border overflow-hidden">
                                <button
                                    className="w-full p-6 flex items-center justify-between text-left"
                                    onClick={() => setExpandedExample(expandedExample === 1 ? null : 1)}
                                >
                                    <h3 className="font-semibold">Example 1: Basic Proxy Bidding</h3>
                                    {expandedExample === 1 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                                {expandedExample === 1 && (
                                    <div className="px-6 pb-6 space-y-4">
                                        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2">
                                            <p><strong>Starting Price:</strong> $100 | <strong>Min Increment:</strong> $10</p>
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-green-600">→ Nimesha sets proxy bid: Max $200</p>
                                                <p className="text-muted-foreground">   System auto-bids: $110 (Nimesha leads)</p>
                                            </div>
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-blue-600">→ Vishwa places manual bid: $130</p>
                                                <p className="text-green-600">→ System auto-bids for Nimesha: $140</p>
                                                <p className="text-muted-foreground">   (Nimesha still leads)</p>
                                            </div>
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-blue-600">→ Vishwa places manual bid: $180</p>
                                                <p className="text-green-600">→ System auto-bids for Nimesha: $190</p>
                                                <p className="text-muted-foreground">   (Nimesha still leads)</p>
                                            </div>
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-blue-600">→ Vishwa places manual bid: $210</p>
                                                <p className="text-red-600">→ Nimesha's max ($200) exceeded - Vishwa wins!</p>
                                                <p className="text-muted-foreground">   Nimesha receives "Outbid" notification</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Example 2 */}
                            <div className="bg-card rounded-xl border overflow-hidden">
                                <button
                                    className="w-full p-6 flex items-center justify-between text-left"
                                    onClick={() => setExpandedExample(expandedExample === 2 ? null : 2)}
                                >
                                    <h3 className="font-semibold">Example 2: Two Proxy Bids Compete</h3>
                                    {expandedExample === 2 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                                {expandedExample === 2 && (
                                    <div className="px-6 pb-6 space-y-4">
                                        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2">
                                            <p><strong>Current Price:</strong> $100 | <strong>Min Increment:</strong> $10</p>
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-green-600">→ Nimesha sets proxy bid: Max $300</p>
                                                <p className="text-muted-foreground">   System auto-bids: $110 (Nimesha leads)</p>
                                            </div>
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-blue-600">→ Vishwa sets proxy bid: Max $250</p>
                                                <p className="text-muted-foreground">   System compares: Nimesha has higher max</p>
                                                <p className="text-green-600">→ Price jumps to: $260 (Vishwa's max + increment)</p>
                                                <p className="text-muted-foreground">   Nimesha wins at $260 instantly</p>
                                                <p className="text-muted-foreground">   Vishwa's proxy is exhausted</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            <strong>Key insight:</strong> Nimesha only pays $260, not her full $300 max. She saved $40 because the system only bids what's necessary.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Example 3 */}
                            <div className="bg-card rounded-xl border overflow-hidden">
                                <button
                                    className="w-full p-6 flex items-center justify-between text-left"
                                    onClick={() => setExpandedExample(expandedExample === 3 ? null : 3)}
                                >
                                    <h3 className="font-semibold">Example 3: Updating Your Proxy Bid</h3>
                                    {expandedExample === 3 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                                {expandedExample === 3 && (
                                    <div className="px-6 pb-6 space-y-4">
                                        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2">
                                            <p><strong>Current Price:</strong> $150 | <strong>Min Increment:</strong> $10</p>
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-green-600">→ Nimesha has proxy bid: Max $200 (leading at $160)</p>
                                            </div>
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-blue-600">→ Vishwa bids $210 (outbids Nimesha)</p>
                                                <p className="text-red-600">→ Nimesha gets "Outbid" notification</p>
                                            </div>
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-green-600">→ Nimesha increases proxy to Max $300</p>
                                                <p className="text-muted-foreground">   System auto-bids: $220</p>
                                                <p className="text-green-600">   Nimesha leads again!</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            <strong>Tip:</strong> You can update your proxy bid anytime. The new maximum takes effect immediately.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-16 bg-muted/30">
                    <div className="container max-w-4xl">
                        <h2 className="font-serif text-2xl font-semibold mb-8 text-center">Benefits of Proxy Bidding</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-card rounded-xl border p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Never Miss a Bid</h3>
                                <p className="text-sm text-muted-foreground">
                                    The system bids 24/7, even while you sleep. No need to watch auctions constantly.
                                </p>
                            </div>

                            <div className="bg-card rounded-xl border p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Stay Within Budget</h3>
                                <p className="text-sm text-muted-foreground">
                                    Set your max and never overspend. You'll never pay more than you intended.
                                </p>
                            </div>

                            <div className="bg-card rounded-xl border p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Zap className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Win at the Best Price</h3>
                                <p className="text-sm text-muted-foreground">
                                    The system only bids the minimum needed. You often win for less than your max.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-16 border-b">
                    <div className="container max-w-4xl">
                        <h2 className="font-serif text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-2">Can other bidders see my maximum?</h3>
                                        <p className="text-muted-foreground text-sm">
                                            No. Your maximum bid is completely private. Other bidders only see the current price, not the hidden maximums of proxy bids.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-2">What if two people have the same maximum?</h3>
                                        <p className="text-muted-foreground text-sm">
                                            The person who placed their proxy bid first wins. This encourages setting your true maximum early rather than waiting.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-2">Can I cancel my proxy bid?</h3>
                                        <p className="text-muted-foreground text-sm">
                                            You cannot cancel a proxy bid, but you can let it be outbid naturally. If you're the current winner, you're committed to buy at that price if the auction ends.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-2">Can I use both manual and proxy bidding?</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Yes! You can place manual bids anytime. If you also have a proxy bid set, manual bids you place won't trigger your proxy (you can't outbid yourself).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16">
                    <div className="container text-center">
                        <h2 className="font-serif text-2xl font-semibold mb-4">Ready to Start Bidding?</h2>
                        <p className="text-muted-foreground mb-8">
                            Browse our live auctions and try proxy bidding for yourself.
                        </p>
                        <Link to="/auctions">
                            <Button size="lg">
                                Browse Auctions
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HowItWorks;
