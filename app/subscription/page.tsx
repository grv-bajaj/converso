import Image from "next/image";
import Link from "next/link";

const Subscription = () => {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      credits: "50",
      description: "Perfect for getting started",
      features: [
        "50 companion lessons/month",
        "Basic voice options",
        "Standard support",
        "5 custom companions",
      ],
      popular: false,
      buttonText: "Start Free Trial",
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      credits: "500",
      description: "Most popular choice",
      features: [
        "500 companion lessons/month",
        "All voice options including custom",
        "Priority support",
        "Unlimited custom companions",
        "Advanced analytics",
        "Custom branding",
      ],
      popular: true,
      buttonText: "Upgrade Now",
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      credits: "Unlimited",
      description: "For serious educators",
      features: [
        "Unlimited companion lessons",
        "All voice options",
        "24/7 dedicated support",
        "Unlimited custom companions",
        "Advanced analytics & reporting",
        "Custom branding & domain",
        "API access",
        "Team management",
      ],
      popular: false,
      buttonText: "Contact Sales",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-red-100 dark:bg-red-950/50 rounded-full">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              ⚠️ Credits Expired
            </p>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Your Credits Have Expired
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Upgrade your plan to continue creating AI companion lessons and
            unlock premium features for your classroom.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/companions"
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition"
            >
              ← Back to Companions
            </Link>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? "ring-2 ring-orange-500 shadow-2xl scale-105"
                  : "bg-card border border-border shadow-lg hover:shadow-xl"
              } ${plan.popular ? "bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-card border border-orange-300 dark:border-orange-900/70" : "bg-card"}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 rounded-bl-2xl rounded-tr-2xl text-sm font-bold">
                  RECOMMENDED
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-orange-600">
                      {plan.credits}
                    </span>{" "}
                    credits per month
                  </p>
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 mb-8 ${
                    plan.popular
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.buttonText}
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex gap-3">
                      <Image
                        src="/icons/check.svg"
                        alt="check"
                        width={20}
                        height={20}
                        className="flex-shrink-0 text-green-500"
                      />
                      <span className="text-muted-foreground text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* FAQ Section */}
        <section className="bg-card border border-border rounded-2xl shadow-lg p-12 max-w-3xl mx-auto text-card-foreground">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. No questions
                asked. Your access will continue through the end of your billing
                period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What happens to my companions when I upgrade?
              </h3>
              <p className="text-muted-foreground">
                All your created companions and lesson history are preserved.
                They'll be available immediately on any plan.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Do you offer a free trial?
              </h3>
              <p className="text-muted-foreground">
                Yes! The Starter plan comes with a 7-day free trial. No credit
                card required to start.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Can I switch plans later?
              </h3>
              <p className="text-muted-foreground">
                Absolutely. You can upgrade or downgrade your plan at any time.
                Changes take effect in your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American
                Express) and digital payment methods through Stripe.
              </p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to continue learning?
          </h3>
          <p className="text-muted-foreground mb-8">
            Choose a plan and start creating AI-powered lessons for your
            students today.
          </p>
          <button className="px-8 py-4 bg-orange-500 text-white rounded-lg font-bold text-lg hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl">
            Get Started Now
          </button>
        </section>
      </div>
    </main>
  );
};

export default Subscription;
