import { FileText, Clock, AlertCircle } from "lucide-react";

export function Problem() {
  const painPoints = [
    {
      icon: FileText,
      stat: "80-200 pages",
      title: "RLPs are overwhelming",
      description:
        "Hidden compliance rules, security levels, ABAAS requirements, and pricing formulas buried in dense government documents.",
    },
    {
      icon: Clock,
      stat: "8-12 hours",
      title: "Manual process kills deals",
      description:
        "Brokers spend days on each submission—extracting requirements, building compliance matrices, calculating pricing.",
    },
    {
      icon: AlertCircle,
      stat: "70%+",
      title: "Opportunities missed",
      description:
        "By the time you find an RLP, read it, and determine if your property qualifies, the deadline has passed.",
    },
  ];

  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Federal Leasing is Broken
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            The federal government pays{" "}
            <span className="font-semibold text-[var(--color-fedspace-primary)]">
              $6 billion annually
            </span>{" "}
            to rent commercial space. Most of it goes to the same landlords because breaking in is too hard.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="bg-[#F7F7F8] rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[var(--color-fedspace-primary)] rounded-2xl flex items-center justify-center shadow-md">
                    <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {point.stat}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-fedspace-primary)] mb-3">
                    {point.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
