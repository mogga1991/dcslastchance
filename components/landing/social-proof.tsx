export function SocialProof() {
  const stats = [
    {
      number: "$6B",
      label: "Annual Federal Lease Spending",
      description: "GSA & federal agencies combined",
    },
    {
      number: "7,500+",
      label: "GSA-Managed Leases",
      description: "Across all 50 states",
    },
    {
      number: "174M",
      label: "Square Feet of Federal Space",
      description: "Leased from private landlords",
    },
    {
      number: "500+",
      label: "Active Opportunities",
      description: "Real-time SAM.gov solicitations",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            The Federal Leasing Market
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Real GSA and federal lease data powering your opportunities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-3">
                <div className="text-5xl sm:text-6xl font-bold text-[var(--color-fedspace-primary)] mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Context Box */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              In 2025, DOGE terminated{" "}
              <span className="font-bold text-gray-900">260 federal leases</span>—creating chaos
              for some landlords and{" "}
              <span className="font-bold text-[var(--color-fedspace-primary)]">
                unprecedented opportunity
              </span>{" "}
              for others. FedSpace helps you find and win the opportunities that match your properties.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
