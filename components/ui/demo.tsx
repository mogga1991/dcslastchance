"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function Demo() {
  return (
    <section className="w-full bg-white">
      <div className="relative mx-auto max-w-5xl px-4 py-16">
        <div className="absolute -z-50 size-[400px] -top-10 -left-20 aspect-square rounded-full bg-indigo-500/30 blur-3xl"></div>
        <p className="text-slate-800 text-lg text-left max-w-3xl">
          FedSpace transforms complex government solicitations into actionable intelligence, helping contractors win more federal contracts with AI-powered analysis and compliance automation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-10">
          <div className="md:col-span-2">
            <img
              alt="FedSpace platform dashboard showing RFP analysis"
              className="rounded-xl object-cover w-full h-auto shadow-lg"
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop"
            />
          </div>
          <div className="md:col-span-1">
            <img
              alt="Compliance matrix and bid scoring interface"
              className="rounded-xl object-cover w-full h-auto shadow-md hover:-translate-y-0.5 transition duration-300"
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop"
            />
            <h3 className="text-[24px]/7.5 text-slate-800 font-medium mt-6">
              AI-powered extraction with 96.3% accuracy on government contracts
            </h3>
            <p className="text-slate-600 mt-2">
              FedSpace empowers capture teams to analyze opportunities 10x faster while reducing compliance risk and improving bid quality.
            </p>
            <a
              href="/dashboard/upload"
              className="group flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 transition"
            >
              Start analyzing your first RFP
              <ArrowUpRight className="size-5 group-hover:translate-x-0.5 transition duration-300" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
