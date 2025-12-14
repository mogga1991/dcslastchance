"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Target,
  CheckCircle2,
  Sparkles,
  Upload,
  Download,
  Eye,
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
    executiveSummary: "",
    technicalApproach: "",
    managementPlan: "",
    pastPerformance: "",
    pricingStrategy: "",
    teamMembers: ["John Doe - Project Manager", "Jane Smith - Technical Lead"],
    aiSuggestions: [
      "Consider highlighting your team's experience with similar infrastructure projects in the past performance section.",
      "Add specific metrics from previous projects to strengthen credibility.",
      "Include risk mitigation strategies in the management plan."
    ]
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
    executiveSummary: "",
    technicalApproach: "",
    managementPlan: "",
    pastPerformance: "",
    pricingStrategy: "",
    teamMembers: [],
    aiSuggestions: [
      "Emphasize your IoT and smart city technology expertise.",
      "Include case studies from similar transportation projects."
    ]
  },
];

export default function ProposalEditPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  // Find the proposal
  const proposal = mockProposals.find(p => p.id === proposalId);

  // State for form fields
  const [formData, setFormData] = useState({
    title: proposal?.title || "",
    client: proposal?.client || "",
    description: proposal?.description || "",
    executiveSummary: proposal?.executiveSummary || "",
    technicalApproach: proposal?.technicalApproach || "",
    managementPlan: proposal?.managementPlan || "",
    pastPerformance: proposal?.pastPerformance || "",
    pricingStrategy: proposal?.pricingStrategy || "",
    contractValue: proposal?.contractValue || 0,
    dueDate: proposal?.dueDate || "",
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);

  if (!proposal) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Proposal not found</h2>
          <p className="text-muted-foreground mb-6">The proposal you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard/my-proposals")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success message
    alert("Proposal saved successfully!");
  };

  const handleSubmit = () => {
    // Submit logic
    alert("Proposal submitted!");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Draft</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "submitted":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Submitted</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/my-proposals")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Proposals
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold tracking-tight">{proposal.title}</h1>
              {getStatusBadge(proposal.status)}
            </div>
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>{proposal.client}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>{proposal.type}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(proposal.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span>{formatCurrency(proposal.contractValue)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-2" />
              Submit Proposal
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Overall Progress</div>
            <div className="text-sm text-muted-foreground">{proposal.progress}% Complete</div>
          </div>
          <Progress value={proposal.progress} className="h-2" />
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">Current Stage:</span>
              <span className="font-medium">{proposal.currentStage}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {proposal.aiSuggestions && proposal.aiSuggestions.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Suggestions
            </CardTitle>
            <CardDescription>Recommendations to improve your proposal</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {proposal.aiSuggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="technical">Technical Approach</TabsTrigger>
          <TabsTrigger value="management">Management Plan</TabsTrigger>
          <TabsTrigger value="past">Past Performance</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Overview</CardTitle>
              <CardDescription>Basic information about this proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client Name</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractValue">Contract Value</Label>
                  <Input
                    id="contractValue"
                    type="number"
                    value={formData.contractValue}
                    onChange={(e) => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a brief description of the project..."
                />
              </div>

              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="space-y-2">
                  {proposal.teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{member}</span>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executive Summary Tab */}
        <TabsContent value="executive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>
                Provide a concise overview of your proposal and value proposition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={12}
                value={formData.executiveSummary}
                onChange={(e) => setFormData({ ...formData, executiveSummary: e.target.value })}
                placeholder="Write your executive summary here..."
                className="min-h-[300px]"
              />
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Assist
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import from File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Approach Tab */}
        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Approach</CardTitle>
              <CardDescription>
                Describe your technical solution and implementation strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={12}
                value={formData.technicalApproach}
                onChange={(e) => setFormData({ ...formData, technicalApproach: e.target.value })}
                placeholder="Describe your technical approach..."
                className="min-h-[300px]"
              />
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Assist
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import from File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Plan Tab */}
        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Management Plan</CardTitle>
              <CardDescription>
                Outline your project management approach and organizational structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={12}
                value={formData.managementPlan}
                onChange={(e) => setFormData({ ...formData, managementPlan: e.target.value })}
                placeholder="Describe your management plan..."
                className="min-h-[300px]"
              />
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Assist
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import from File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Past Performance Tab */}
        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Performance</CardTitle>
              <CardDescription>
                Highlight relevant past projects and proven track record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={12}
                value={formData.pastPerformance}
                onChange={(e) => setFormData({ ...formData, pastPerformance: e.target.value })}
                placeholder="List your past performance and relevant projects..."
                className="min-h-[300px]"
              />
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Assist
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import from File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Strategy</CardTitle>
              <CardDescription>
                Detail your pricing approach and cost breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={12}
                value={formData.pricingStrategy}
                onChange={(e) => setFormData({ ...formData, pricingStrategy: e.target.value })}
                placeholder="Describe your pricing strategy and cost breakdown..."
                className="min-h-[300px]"
              />
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Assist
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import from File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Actions */}
      <div className="mt-6 flex justify-between items-center pb-8">
        <Button variant="outline" onClick={() => router.push("/dashboard/my-proposals")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Submit Proposal
          </Button>
        </div>
      </div>
    </div>
  );
}
