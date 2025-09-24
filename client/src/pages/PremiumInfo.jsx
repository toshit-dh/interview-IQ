import React, { useState } from "react";
import {
  Crown,
  CheckCircle,
  X,
  Zap,
  Users,
  TrendingUp,
  Shield,
  Sparkles,
  Infinity,
  HeartHandshake,
} from "lucide-react";

export function PremiumInfo() {
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const PricingCard = ({
    planName,
    price,
    usdPrice,
    color,
    gradient,
    borderColor,
    features,
    isPopular = false,
    planKey,
    maxPaths,
    historyRetention,
  }) => (
    <div
      className={`relative rounded-xl shadow-lg border transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        planKey === selectedPlan ? "ring-2 ring-purple-400 scale-105" : ""
      } ${gradient} ${borderColor}`}
      onClick={() => setSelectedPlan(planKey)}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
            <Sparkles className="w-4 h-4 mr-1" />
            MOST POPULAR
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
              planKey === "basic"
                ? "bg-green-500/20"
                : planKey === "pro"
                ? "bg-blue-500/20"
                : "bg-purple-500/20"
            }`}
          >
            {planKey === "basic" && (
              <Shield className="w-8 h-8 text-green-400" />
            )}
            {planKey === "pro" && (
              <TrendingUp className="w-8 h-8 text-blue-400" />
            )}
            {planKey === "elite" && (
              <Crown className="w-8 h-8 text-purple-400" />
            )}
          </div>

          <h3 className={`text-2xl font-bold mb-2 ${color}`}>{planName}</h3>

          <div className="mb-4">
            <span className={`text-4xl font-bold ${color}`}>₹{price}</span>
            <span className="text-gray-400">/month</span>
            <div className="text-sm text-gray-400 mt-1">≈ ${usdPrice} USD</div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className={`p-3 rounded-lg ${
              planKey === "basic"
                ? "bg-green-500/10"
                : planKey === "pro"
                ? "bg-blue-500/10"
                : "bg-purple-500/10"
            }`}
          >
            <div className="text-center">
              <div className={`text-lg font-bold ${color}`}>
                {maxPaths === "Unlimited" ? (
                  <Infinity className="w-6 h-6 mx-auto" />
                ) : (
                  maxPaths
                )}
              </div>
              <div className="text-xs text-gray-400">Interview Paths</div>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg ${
              planKey === "basic"
                ? "bg-green-500/10"
                : planKey === "pro"
                ? "bg-blue-500/10"
                : "bg-purple-500/10"
            }`}
          >
            <div className="text-center">
              <div
                className={`text-lg font-bold ${color} flex items-center justify-center`}
              >
                {historyRetention === "Unlimited" ? (
                  <Infinity className="w-6 h-6" />
                ) : historyRetention === "0 days" ? (
                  "0"
                ) : (
                  historyRetention
                )}
              </div>
              <div className="text-xs text-gray-400">History</div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              {feature.included ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <span
                className={`text-sm ${
                  feature.included
                    ? "text-gray-300"
                    : "text-gray-500 line-through"
                }`}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            planKey === "basic"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400"
              : planKey === "pro"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400"
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400"
          } shadow-lg hover:shadow-xl`}
        >
          {planKey === selectedPlan ? "Current Plan" : "Choose Plan"}
        </button>
      </div>
    </div>
  );

  const AddOnCard = ({
    title,
    description,
    price,
    icon: Icon,
    gradient,
    color,
  }) => (
    <div
      className={`p-6 rounded-xl shadow-lg border border-gray-600/30 ${gradient} hover:scale-105 transition-all duration-300`}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6 text-orange-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
          <p className="text-gray-300 text-sm mb-3">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-400">₹{price}</span>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-semibold hover:from-orange-400 hover:to-red-400 transition-all">
              Add On
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const basicFeatures = [
    { text: "Max 5 interview paths", included: true },
    { text: "Content + Audio + Expression evaluation", included: true },
    { text: "Basic interview analytics", included: true },
    { text: "Interview history retention: 0 days", included: true },
    { text: "Email support", included: true },
    { text: "Advanced analytics & reports", included: false },
    { text: "Resume analysis features", included: false },
    { text: "Priority support", included: false },
  ];

  const proFeatures = [
    { text: "Max 10 interview paths", included: true },
    { text: "Full behavioral analytics reporting", included: true },
    { text: "Tone, hesitation, confidence analysis", included: true },
    { text: "Eye movement tracking", included: true },
    { text: "Interview history retention: 30 days", included: true },
    { text: "Advanced AI insights & recommendations", included: true },
    { text: "Priority support", included: true },
    { text: "PDF report generation", included: false },
  ];

  const eliteFeatures = [
    { text: "Unlimited interview paths", included: true },
    { text: "All Pro features included", included: true },
    { text: "PDF reports generated automatically", included: true },
    { text: "Unlimited interview history retention", included: true },
    { text: "Resume analysis & optimization", included: true },
    { text: "Deep AI insights + career roadmap", included: true },
    { text: "Top-tier priority support", included: true },
    { text: "Personal interview coach", included: true },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Pricing Plans & Features
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-2">
            Choose the perfect plan for your interview preparation journey
          </p>
          <p className="text-gray-400">
            Unlock advanced AI-powered insights and comprehensive analytics
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Basic Plan */}
          <PricingCard
            planName="Basic Plan"
            price="499"
            usdPrice="6"
            color="text-green-400"
            gradient="bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900"
            borderColor="border-green-500/20 hover:border-green-500/40"
            features={basicFeatures}
            planKey="basic"
            maxPaths="5"
            historyRetention="0 days"
          />

          {/* Pro Plan */}
          <PricingCard
            planName="Pro Plan"
            price="999"
            usdPrice="12"
            color="text-blue-400"
            gradient="bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"
            borderColor="border-blue-500/20 hover:border-blue-500/40"
            features={proFeatures}
            isPopular={true}
            planKey="pro"
            maxPaths="10"
            historyRetention="30 days"
          />

          {/* Elite Plan */}
          <PricingCard
            planName="Elite Plan"
            price="1,999"
            usdPrice="24"
            color="text-purple-400"
            gradient="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"
            borderColor="border-purple-500/20 hover:border-purple-500/40"
            features={eliteFeatures}
            planKey="elite"
            maxPaths="Unlimited"
            historyRetention="Unlimited"
          />
        </div>

        {/* Add-ons Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-orange-400 mr-3" />
              Optional Add-ons
            </h2>
            <p className="text-gray-400">
              Enhance your experience with premium one-time services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AddOnCard
              title="Mock Panel Interview"
              description="Practice with multiple AI personas simulating real interview panels"
              price="299"
              icon={Users}
              gradient="bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900"
              color="bg-orange-500/20"
            />

            <AddOnCard
              title="Expert Human Review"
              description="Get personalized feedback from experienced HR professionals"
              price="999"
              icon={HeartHandshake}
              gradient="bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900"
              color="bg-red-500/20"
            />
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Detailed Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="pb-4 text-gray-300 font-medium">Feature</th>
                  <th className="pb-4 text-center text-green-400 font-medium">
                    Basic
                  </th>
                  <th className="pb-4 text-center text-blue-400 font-medium">
                    Pro
                  </th>
                  <th className="pb-4 text-center text-purple-400 font-medium">
                    Elite
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "Interview Paths",
                    basic: "5",
                    pro: "10",
                    elite: "Unlimited",
                  },
                  {
                    feature: "Content Analysis",
                    basic: true,
                    pro: true,
                    elite: true,
                  },
                  {
                    feature: "Audio Analysis",
                    basic: true,
                    pro: true,
                    elite: true,
                  },
                  {
                    feature: "Expression Analysis",
                    basic: true,
                    pro: true,
                    elite: true,
                  },
                  {
                    feature: "Behavioral Analytics",
                    basic: false,
                    pro: true,
                    elite: true,
                  },
                  {
                    feature: "History Retention",
                    basic: "0 days",
                    pro: "30 days",
                    elite: "Unlimited",
                  },
                  {
                    feature: "AI Insights",
                    basic: false,
                    pro: true,
                    elite: true,
                  },
                  {
                    feature: "PDF Reports",
                    basic: false,
                    pro: false,
                    elite: true,
                  },
                  {
                    feature: "Resume Analysis",
                    basic: false,
                    pro: false,
                    elite: true,
                  },
                  {
                    feature: "Career Roadmap",
                    basic: false,
                    pro: false,
                    elite: true,
                  },
                  {
                    feature: "Priority Support",
                    basic: false,
                    pro: true,
                    elite: true,
                  },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3 text-white font-medium">
                      {row.feature}
                    </td>
                    <td className="py-3 text-center">
                      {typeof row.basic === "boolean" ? (
                        row.basic ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-green-400 font-semibold">
                          {row.basic}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-blue-400 font-semibold">
                          {row.pro}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {typeof row.elite === "boolean" ? (
                        row.elite ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-purple-400 font-semibold">
                          {row.elite}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Interview Skills?
          </h3>
          <p className="text-gray-300 mb-6">
            Join thousands of candidates who have improved their interview
            performance with our AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-400 hover:to-emerald-400 transition-all">
              Start with Basic Plan
            </button>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-400 hover:to-pink-400 transition-all flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Go Pro Today</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
