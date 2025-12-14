"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EvidenceSheet } from "./evidence-sheet";
import { FileSearch, Download, Filter } from "lucide-react";
import type { ComplianceMatrixRow, WorkflowStage } from "@/lib/proposaliq/schemas";

type ComplianceMatrixTableProps = {
  rows: ComplianceMatrixRow[];
  documentId?: string;
  showWorkflowStage?: boolean;
  onRowUpdate?: (reqId: string, updates: Partial<ComplianceMatrixRow>) => void;
};

const WORKFLOW_STAGE_COLORS: Record<WorkflowStage, string> = {
  Intake: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  StrategicAssessment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  CompanyAssessment: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  BidScorecard: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  DecisionDashboard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  ProposalAssembly: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  DraftStudio: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  OpportunityGateway: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export function ComplianceMatrixTable({
  rows,
  documentId,
  showWorkflowStage = false,
  onRowUpdate,
}: ComplianceMatrixTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | ComplianceMatrixRow["priority"]>("All");
  const [stageFilter, setStageFilter] = useState<WorkflowStage | "All">("All");
  const [evidenceSheetOpen, setEvidenceSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ComplianceMatrixRow | null>(null);

  const filtered = useMemo(() => {
    return (rows || []).filter((r) => {
      const matchQuery =
        !searchQuery ||
        r.requirement_statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.req_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.requirement_type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPriority = priorityFilter === "All" || r.priority === priorityFilter;

      const matchStage =
        stageFilter === "All" || r.workflow_stage === stageFilter;

      return matchQuery && matchPriority && matchStage;
    });
  }, [rows, searchQuery, priorityFilter, stageFilter]);

  function handleEvidenceClick(row: ComplianceMatrixRow) {
    setSelectedRow(row);
    setEvidenceSheetOpen(true);
  }

  function handleStatusChange(reqId: string, newStatus: string) {
    onRowUpdate?.(reqId, { status: newStatus });
  }

  function exportToCSV() {
    const headers = [
      "ID",
      "Priority",
      "Type",
      "Requirement",
      "Status",
      "Page",
      "Section",
      ...(showWorkflowStage ? ["Workflow Stage"] : []),
    ];

    const csvRows = filtered.map((r) => [
      r.req_id,
      r.priority,
      r.requirement_type,
      `"${r.requirement_statement.replace(/"/g, '""')}"`,
      r.status,
      r.source?.page ?? "",
      r.source?.section ?? "",
      ...(showWorkflowStage ? [r.workflow_stage ?? ""] : []),
    ]);

    const csv = [headers, ...csvRows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-matrix-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const priorityCounts = {
    Must: rows.filter((r) => r.priority === "Must").length,
    Should: rows.filter((r) => r.priority === "Should").length,
    May: rows.filter((r) => r.priority === "May").length,
  };

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader className="space-y-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <CardTitle className="text-xl">Compliance Matrix</CardTitle>
              <div className="mt-1 flex gap-2 text-sm text-muted-foreground">
                <span>{filtered.length} requirements</span>
                <span>•</span>
                <span>{priorityCounts.Must} Must</span>
                <span>•</span>
                <span>{priorityCounts.Should} Should</span>
                <span>•</span>
                <span>{priorityCounts.May} May</span>
              </div>
            </div>

            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requirements..."
              className="md:max-w-xs"
            />

            <Select
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}
            >
              <SelectTrigger className="md:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priority</SelectItem>
                <SelectItem value="Must">Must</SelectItem>
                <SelectItem value="Should">Should</SelectItem>
                <SelectItem value="May">May</SelectItem>
              </SelectContent>
            </Select>

            {showWorkflowStage && (
              <Select
                value={stageFilter}
                onValueChange={(v) => setStageFilter(v as typeof stageFilter)}
              >
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Stages</SelectItem>
                  <SelectItem value="Intake">Intake</SelectItem>
                  <SelectItem value="StrategicAssessment">Strategic Assessment</SelectItem>
                  <SelectItem value="CompanyAssessment">Company Assessment</SelectItem>
                  <SelectItem value="BidScorecard">Bid Scorecard</SelectItem>
                  <SelectItem value="DecisionDashboard">Decision Dashboard</SelectItem>
                  <SelectItem value="ProposalAssembly">Proposal Assembly</SelectItem>
                  <SelectItem value="DraftStudio">Draft Studio</SelectItem>
                  <SelectItem value="OpportunityGateway">Opportunity Gateway</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead className="w-24">Priority</TableHead>
                  <TableHead className="w-32">Type</TableHead>
                  <TableHead>Requirement</TableHead>
                  {showWorkflowStage && <TableHead className="w-40">Stage</TableHead>}
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-24 text-center">Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.req_id}>
                    <TableCell className="font-mono text-sm">{row.req_id}</TableCell>

                    <TableCell>
                      <Badge
                        variant={row.priority === "Must" ? "default" : "secondary"}
                      >
                        {row.priority}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {row.requirement_type}
                    </TableCell>

                    <TableCell className="max-w-[500px]">
                      <div className="line-clamp-2 text-sm">
                        {row.requirement_statement}
                      </div>
                    </TableCell>

                    {showWorkflowStage && (
                      <TableCell>
                        {row.workflow_stage && (
                          <Badge
                            variant="outline"
                            className={WORKFLOW_STAGE_COLORS[row.workflow_stage]}
                          >
                            {row.workflow_stage}
                          </Badge>
                        )}
                      </TableCell>
                    )}

                    <TableCell>
                      <Select
                        value={row.status}
                        onValueChange={(v) => handleStatusChange(row.req_id, v)}
                        disabled={!onRowUpdate}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-center">
                      {row.source?.page ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEvidenceClick(row)}
                          className="gap-1"
                        >
                          <FileSearch className="h-4 w-4" />
                          <span className="text-xs">p.{row.source.page}</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={showWorkflowStage ? 7 : 6}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Filter className="h-8 w-8" />
                        <div>No requirements found</div>
                        <div className="text-sm">
                          Try adjusting your search or filters
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Sheet */}
      {selectedRow && (
        <EvidenceSheet
          open={evidenceSheetOpen}
          onOpenChange={setEvidenceSheetOpen}
          evidence={selectedRow.source || {}}
          documentId={documentId}
          requirementId={selectedRow.req_id}
          requirementText={selectedRow.requirement_statement}
        />
      )}
    </>
  );
}
