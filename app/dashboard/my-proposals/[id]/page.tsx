"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Save,
  Send,
  Eye,
  MoreVertical,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data - in production this would come from API
const mockProposals = [
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
    description: "Complete modernization of city infrastructure systems including water, power, and telecommunications.",
    content: `On April 28th 2023, 1. Officer Ian Rogers (Badge USC 114), responded to a reported infrastructure assessment at the City Department. The assessment was received at 8:30 a.m., though it occurred sometime after 10 p.m. the previous night.

The project manager reported that this Infrastructure Modernization initiative involves comprehensive upgrades to water, power, and telecommunications systems across the metropolitan area.

Mr. Johnson provided a description of the project scope: a multi-phase approach, approximately six years duration, targeting critical infrastructure systems serving 200,000+ residents, with emphasis on sustainability and resilience.

Upon inspection of the project site, we observed that planning documents had been prepared, indicating a thorough assessment. A business case labeled "Infrastructure 2030" was developed. The stakeholders reported strong support for modernization efforts.

We recommended establishing a governance framework with clear milestones and deliverables. The project scope includes water system improvements, power grid modernization, and telecommunications infrastructure enhancement.

This initiative may be related to other modernization efforts in the region, possibly connected to the broader "Smart Cities" program previously outlined in strategic planning documents.

The project status is active and ongoing, pending detailed cost estimation and resource allocation. Initial planning phases are progressing as scheduled.`,
    qualityScore: 85,
    aiSuggestions: [
      {
        text: "Include specific timelines for your arrival and departure from the scene",
        checked: false,
      },
      {
        text: "Document the exact processing techniques used for evidence collection",
        checked: true,
      },
      {
        text: "Provide more details about attempts to locate and interview potential witnesses",
        checked: false,
      },
      {
        text: "Mention any immediate actions taken to increase police patrols in the area",
        checked: false,
      },
      {
        text: "Include details about any crime prevention advice given to the client",
        checked: true,
      },
    ],
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
    description: "Development and implementation of smart transportation solutions for urban areas.",
    content: "",
    qualityScore: 45,
    aiSuggestions: [
      {
        text: "Emphasize your IoT and smart city technology expertise",
        checked: false,
      },
      {
        text: "Include case studies from similar transportation projects",
        checked: false,
      },
    ],
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
    description: "Complete digital transformation strategy for regional banking operations.",
    content: "",
    qualityScore: 92,
    aiSuggestions: [],
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
    description: "Comprehensive cybersecurity enhancement for federal systems.",
    content: "",
    qualityScore: 68,
    aiSuggestions: [],
  },
];

export default function ProposalEditPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const [proposals] = useState(mockProposals);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Find the current proposal
  const proposal = proposals.find((p) => p.id === proposalId);
  const [content, setContent] = useState(proposal?.content || "");

  useEffect(() => {
    if (proposal) {
      setContent(proposal.content);
    }
  }, [proposal]);

  if (!proposal) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Proposal not found</h2>
          <p className="text-muted-foreground mb-6">The proposal you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push("/dashboard/my-proposals")}>Back to Proposals</Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleSubmit = () => {
    alert("Proposal submitted!");
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
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
            Draft
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
            In Progress
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
            Submitted
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredProposals = proposals.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-blue-500 to-blue-600";
    if (score >= 40) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* LEFT SIDEBAR - Proposals List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">All Proposals</h2>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Sidebar Content - Proposals List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-2 font-medium">Date Updated</div>
            {filteredProposals.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/dashboard/my-proposals/${p.id}`)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  p.id === proposalId
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-sm line-clamp-1 flex-1">{p.title}</h3>
                  <MoreVertical className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{p.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(p.lastUpdated)}
                  </span>
                  {getStatusBadge(p.status)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <Building2 className="w-4 h-4 inline mr-1" />
            ProposalIQ
          </div>
        </div>
      </div>

      {/* CENTER - Main Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-xl font-semibold mb-1">{proposal.title}</h1>
              <p className="text-sm text-gray-600">
                {proposal.client} • Due: {formatDate(proposal.dueDate)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Rich Text Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-2">
          <div className="flex items-center gap-1">
            <Select defaultValue="paragraph">
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraph">Paragraph</SelectItem>
                <SelectItem value="h1">Heading 1</SelectItem>
                <SelectItem value="h2">Heading 2</SelectItem>
                <SelectItem value="h3">Heading 3</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Underline className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ImageIcon className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[600px] border-0 focus:ring-0 text-base leading-relaxed resize-none"
              placeholder="Start writing your proposal..."
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - Suggestions */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
        {/* Suggestions Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Suggestions
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Suggestions Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {proposal.aiSuggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 mb-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {suggestion.checked ? (
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm text-gray-700 leading-relaxed">{suggestion.text}</p>
            </div>
          ))}
        </div>

        {/* Quality Score */}
        <div className="p-6 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-4">Report Result Score</div>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              {/* Background Circle */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(proposal.qualityScore / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className={`${getScoreGradient(proposal.qualityScore).split(' ')[0].replace('from-', '')}`} stopColor="currentColor" />
                    <stop offset="100%" className={`${getScoreGradient(proposal.qualityScore).split(' ')[1].replace('to-', '')}`} stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-3xl font-bold ${getScoreColor(proposal.qualityScore)}`}>
                  {proposal.qualityScore}%
                </div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <div className="text-xs text-gray-500">100%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
