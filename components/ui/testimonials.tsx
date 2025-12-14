import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Testimonials() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-4xl font-medium lg:text-5xl">Trusted by government contractors nationwide</h2>
                    <p>ProposalIQ is transforming how capture managers and BD teams analyze RFPs, saving countless hours and winning more contracts.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
                    <Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2">
                        <CardHeader>
                            <img
                                className="h-8 w-fit"
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Lockheed_Martin_logo.svg/2560px-Lockheed_Martin_logo.svg.png"
                                alt="Defense Contractor"
                                height="32"
                                width="auto"
                            />
                        </CardHeader>
                        <CardContent>
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">ProposalIQ has completely transformed our capture process. What used to take our team 12+ hours to analyze an RFP now takes less than 30 minutes. The AI extraction is incredibly accurate, and the bid/no-bid scoring has helped us focus on opportunities where we actually have a competitive advantage. This platform is a game-changer for government contracting.</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://randomuser.me/api/portraits/women/44.jpg"
                                            alt="Sarah Mitchell"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback>SM</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <cite className="text-sm font-medium">Sarah Mitchell</cite>
                                        <span className="text-muted-foreground block text-sm">VP of Capture, Defense Contractor</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">The compliance matrix feature alone is worth the subscription. Instead of manually combing through 200-page RFPs, ProposalIQ extracts every requirement automatically. Our win rate has increased by 23% since we started using it.</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://randomuser.me/api/portraits/men/32.jpg"
                                            alt="Marcus Johnson"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback>MJ</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">Marcus Johnson</cite>
                                        <span className="text-muted-foreground block text-sm">Proposal Manager, IT Services</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p>As a small business, we can't afford to waste resources on losing bids. ProposalIQ's bid scoring has been incredibly accurate in helping us identify which opportunities to pursue. Absolutely essential tool!</p>

                                <div className="grid items-center gap-3 [grid-template-columns:auto_1fr]">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://randomuser.me/api/portraits/women/68.jpg"
                                            alt="Jennifer Chen"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback>JC</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">Jennifer Chen</cite>
                                        <span className="text-muted-foreground block text-sm">CEO, 8(a) Certified Firm</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="card variant-mixed">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p>The competitive intelligence extraction is phenomenal. ProposalIQ identifies incumbents, past performance requirements, and evaluation criteria faster than any analyst on my team. Highly recommended!</p>

                                <div className="grid grid-cols-[auto_1fr] gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src="https://randomuser.me/api/portraits/men/52.jpg"
                                            alt="David Rodriguez"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback>DR</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">David Rodriguez</p>
                                        <span className="text-muted-foreground block text-sm">Director of BD, Federal Contractor</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
