"use client";

export default function FeatureSections() {
  return (
    <section className="w-full py-16 px-4">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold">Platform Performance Metrics</h1>
        <p className="text-sm text-slate-500 mt-2">
          Real-time insights and analytics to accelerate your government contracting success
        </p>
      </div>

      {/* Feature cards */}
      <div className="flex flex-wrap items-start justify-center gap-10">
        <div className="max-w-80 hover:-translate-y-0.5 transition duration-300">
          <img
            className="rounded-xl object-cover h-64 w-full"
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
            alt="Analytics dashboard"
          />
          <h3 className="text-base font-semibold text-slate-700 mt-4">Real-Time Analysis Dashboard</h3>
          <p className="text-sm text-slate-600 mt-1">
            Monitor your RFP pipeline with live extraction status, bid scores, and opportunity tracking across all federal solicitations.
          </p>
        </div>

        <div className="max-w-80 hover:-translate-y-0.5 transition duration-300">
          <img
            className="rounded-xl object-cover h-64 w-full"
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
            alt="Team collaboration"
          />
          <h3 className="text-base font-semibold text-slate-700 mt-4">Team Collaboration Tools</h3>
          <p className="text-sm text-slate-600 mt-1">
            Manage capture teams with role-based access, shared compliance matrices, and automated deadline notifications.
          </p>
        </div>

        <div className="max-w-80 hover:-translate-y-0.5 transition duration-300">
          <img
            className="rounded-xl object-cover h-64 w-full"
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
            alt="Performance metrics"
          />
          <h3 className="text-base font-semibold text-slate-700 mt-4">Win Rate Intelligence</h3>
          <p className="text-sm text-slate-600 mt-1">
            Track historical bid decisions, win/loss patterns, and competitive positioning to optimize your proposal strategy.
          </p>
        </div>
      </div>
    </section>
  );
}
