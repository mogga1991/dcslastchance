"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Download,
  MoreVertical,
  Building2,
  FileText,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Proposal {
  id: string;
  title: string;
  status: "draft" | "submitted" | "in_progress";
  client: string;
  type: string;
  dueDate: string;
  contractValue: number;
  currentStage: string;
  progress: number;
  lastUpdated: string;
  winProbability?: number;
  aiQualityScore?: number;
}

const mockProposals: Proposal[] = [
  {
    id: "1",
    title: "Infrastructure Modernization Project",
    status: "in_progress",
    client: "City Infrastructure Department",
    type: "Government RFP",
    dueDate: "2025-01-15",
    contractValue: 12000000,
    currentStage: "Cost Estimation",
    progress: 30,
    lastUpdated: "2024-12-08",
  },
  {
    id: "2",
    title: "Smart City Transportation Initiative",
    status: "draft",
    client: "Department of Transportation",
    type: "Government RFP",
    dueDate: "2025-02-27",
    contractValue: 3200000,
    currentStage: "Requirements Analysis",
    progress: 25,
    lastUpdated: "2024-12-07",
  },
  {
    id: "3",
    title: "Digital Transformation Strategy",
    status: "submitted",
    client: "Regional Bank",
    type: "Consulting Proposal",
    dueDate: "2024-12-14",
    contractValue: 450000,
    currentStage: "Final Review",
    progress: 100,
    lastUpdated: "2024-12-04",
    winProbability: 68,
    aiQualityScore: 82,
  },
  {
    id: "4",
    title: "Cybersecurity Enhancement Program",
    status: "in_progress",
    client: "Federal Defense Agency",
    type: "Government RFP",
    dueDate: "2025-03-10",
    contractValue: 5500000,
    currentStage: "Technical Approach",
    progress: 45,
    lastUpdated: "2024-12-09",
  },
  {
    id: "5",
    title: "Healthcare IT System Upgrade",
    status: "draft",
    client: "State Health Department",
    type: "Government RFP",
    dueDate: "2025-04-20",
    contractValue: 2100000,
    currentStage: "Initial Planning",
    progress: 15,
    lastUpdated: "2024-12-05",
  },
  {
    id: "6",
    title: "Enterprise Resource Planning Implementation",
    status: "submitted",
    client: "Manufacturing Corp",
    type: "Consulting Proposal",
    dueDate: "2024-12-18",
    contractValue: 850000,
    currentStage: "Client Review",
    progress: 100,
    lastUpdated: "2024-12-03",
    winProbability: 72,
    aiQualityScore: 88,
  },
  {
    id: "7",
    title: "Data Center Consolidation",
    status: "in_progress",
    client: "Department of Energy",
    type: "Government RFP",
    dueDate: "2025-02-05",
    contractValue: 1600000,
    currentStage: "Resource Planning",
    progress: 55,
    lastUpdated: "2024-12-10",
  },
  {
    id: "8",
    title: "Cloud Migration Strategy",
    status: "draft",
    client: "Financial Services Group",
    type: "Consulting Proposal",
    dueDate: "2025-05-15",
    contractValue: 1400000,
    currentStage: "Discovery Phase",
    progress: 20,
    lastUpdated: "2024-12-06",
  },
];

export default function MyProposalsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const totalProposals = mockProposals.length;
  const inProgress = mockProposals.filter((p) => p.status === "in_progress").length;
  const submitted = mockProposals.filter((p) => p.status === "submitted").length;
  const totalValue = mockProposals.reduce((sum, p) => sum + p.contractValue, 0);
  const winRate = submitted > 0 ? 50.0 : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(2)}K`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-medium flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Draft
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
            Submitted
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
            In Progress
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Proposals</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your proposal opportunities
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-2">Total Proposals</div>
          <div className="text-3xl font-semibold text-gray-900">{totalProposals}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-blue-600 mb-2">In Progress</div>
          <div className="text-3xl font-semibold text-blue-600">{inProgress}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-purple-600 mb-2">Submitted</div>
          <div className="text-3xl font-semibold text-purple-600">{submitted}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-green-600 mb-2">Win Rate</div>
          <div className="text-3xl font-semibold text-green-600">{winRate}%</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-2">Total Value</div>
          <div className="text-3xl font-semibold text-gray-900">{formatCurrency(totalValue)}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search proposals by title or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-44 border-gray-300">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-44 border-gray-300">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="government">Government RFP</SelectItem>
              <SelectItem value="consulting">Consulting Proposal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-44 border-gray-300">
              <SelectValue placeholder="Most Recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="value_high">Highest Value</SelectItem>
              <SelectItem value="value_low">Lowest Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4 mb-8">
        {mockProposals.map((proposal) => (
          <div
            key={proposal.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            {/* Proposal Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{proposal.title}</h3>
                  {getStatusBadge(proposal.status)}
                </div>
                <div className="flex items-center gap-5 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span>{proposal.client}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>{proposal.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Due: {formatDate(proposal.dueDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Proposal Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-4">
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 mb-1">Contract Value</div>
                <div className="text-xl font-semibold text-green-600">
                  {formatCurrency(proposal.contractValue)}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 mb-1">Current Stage</div>
                <div className="text-sm font-medium">{proposal.currentStage}</div>
              </div>
              <div className="md:col-span-4">
                <div className="text-sm text-gray-600 mb-2">Progress</div>
                <div className="flex items-center gap-3">
                  <Progress value={proposal.progress} className="flex-1 h-2 bg-gray-200 [&>div]:bg-blue-600" />
                  <span className="text-sm font-medium w-10">{proposal.progress}%</span>
                </div>
              </div>
              {proposal.winProbability && (
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Win Probability</div>
                  <div className="text-xl font-semibold text-orange-600">
                    {proposal.winProbability}%
                  </div>
                </div>
              )}
              {proposal.aiQualityScore && (
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    AI Quality Score
                  </div>
                  <div className="text-xl font-semibold text-blue-600">
                    {proposal.aiQualityScore}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Last updated: {formatDate(proposal.lastUpdated)}
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                {proposal.status === "submitted" ? "View Submission" : "Continue Editing"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
