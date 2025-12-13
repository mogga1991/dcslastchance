"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Activity,
  Building2,
  DollarSign,
  MessageSquare,
  MoreVertical,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: "broker" | "realtor" | "salesman" | "owner";
  phone?: string;
  status: "active" | "inactive" | "pending";
  last_login_at?: string;
  total_logins: number;
  listings_posted: number;
  ai_matches_found: number;
  discussions_active: number;
  deals_completed: number;
  total_earnings: number;
  created_at: string;
}

const ROLE_LABELS = {
  broker: "Broker",
  realtor: "Realtor",
  salesman: "Salesman",
  owner: "Owner",
};

const ROLE_COLORS = {
  broker: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  realtor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  salesman: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  owner: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

// Demo placeholder data
const DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "demo-1",
    full_name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "broker",
    phone: "+1 (555) 123-4567",
    status: "active",
    last_login_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    total_logins: 247,
    listings_posted: 18,
    ai_matches_found: 142,
    discussions_active: 23,
    deals_completed: 12,
    total_earnings: 145000,
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
  },
  {
    id: "demo-2",
    full_name: "Michael Chen",
    email: "michael.chen@example.com",
    role: "realtor",
    phone: "+1 (555) 234-5678",
    status: "active",
    last_login_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    total_logins: 189,
    listings_posted: 14,
    ai_matches_found: 98,
    discussions_active: 17,
    deals_completed: 8,
    total_earnings: 98500,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months ago
  },
  {
    id: "demo-3",
    full_name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    role: "salesman",
    phone: "+1 (555) 345-6789",
    status: "active",
    last_login_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    total_logins: 156,
    listings_posted: 22,
    ai_matches_found: 167,
    discussions_active: 31,
    deals_completed: 15,
    total_earnings: 187500,
    created_at: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000).toISOString(), // 7 months ago
  },
  {
    id: "demo-4",
    full_name: "David Park",
    email: "david.park@example.com",
    role: "owner",
    phone: "+1 (555) 456-7890",
    status: "active",
    last_login_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    total_logins: 92,
    listings_posted: 7,
    ai_matches_found: 54,
    discussions_active: 12,
    deals_completed: 5,
    total_earnings: 62000,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
  },
  {
    id: "demo-5",
    full_name: "Jennifer Williams",
    email: "jennifer.williams@example.com",
    role: "broker",
    phone: "+1 (555) 567-8901",
    status: "inactive",
    last_login_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    total_logins: 78,
    listings_posted: 9,
    ai_matches_found: 63,
    discussions_active: 8,
    deals_completed: 4,
    total_earnings: 51200,
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(), // 5 months ago
  },
];

export default function AccountManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [useDemoData, setUseDemoData] = useState(true); // Toggle for demo mode

  // Form states
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "broker" as TeamMember["role"],
    phone: "",
  });

  useEffect(() => {
    if (useDemoData) {
      // Use demo data for demonstration purposes
      setTeamMembers(DEMO_TEAM_MEMBERS);
      setLoading(false);
    } else {
      fetchTeamMembers();
    }
  }, [useDemoData]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team-members");
      const data = await response.json();

      if (response.ok) {
        setTeamMembers(data.teamMembers || []);
      } else {
        toast.error(data.error || "Failed to fetch team members");
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Team member added successfully");
        setAddDialogOpen(false);
        setFormData({
          full_name: "",
          email: "",
          role: "broker",
          phone: "",
        });
        fetchTeamMembers();
      } else {
        toast.error(data.error || "Failed to add team member");
      }
    } catch (error) {
      console.error("Error adding team member:", error);
      toast.error("Failed to add team member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/team-members/${selectedMember.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Team member removed successfully");
        setDeleteDialogOpen(false);
        setSelectedMember(null);
        fetchTeamMembers();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to remove team member");
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    const newStatus = member.status === "active" ? "inactive" : "active";

    try {
      const response = await fetch(`/api/team-members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Team member ${newStatus === "active" ? "activated" : "deactivated"}`);
        fetchTeamMembers();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update team member");
      }
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalStats = {
    totalMembers: teamMembers.length,
    activeMembers: teamMembers.filter((m) => m.status === "active").length,
    totalListings: teamMembers.reduce((sum, m) => sum + m.listings_posted, 0),
    totalEarnings: teamMembers.reduce((sum, m) => sum + Number(m.total_earnings), 0),
    totalDeals: teamMembers.reduce((sum, m) => sum + m.deals_completed, 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.activeMembers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalListings}</div>
            <p className="text-xs text-muted-foreground">Posted by team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Matches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.reduce((sum, m) => sum + m.ai_matches_found, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total matches found</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalDeals}</div>
            <p className="text-xs text-muted-foreground">Successfully closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStats.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">Team commissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your brokers, realtors, salesmen, and building owners
              </CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddMember}>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Add a new broker, realtor, salesman, or building owner to your team
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: TeamMember["role"]) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="broker">Broker</SelectItem>
                          <SelectItem value="realtor">Realtor</SelectItem>
                          <SelectItem value="salesman">Salesman</SelectItem>
                          <SelectItem value="owner">Building Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddDialogOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Adding..." : "Add Member"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No team members yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by adding your first team member
              </p>
              <Button
                className="mt-4 gap-2"
                onClick={() => setAddDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Add Team Member
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Listings</TableHead>
                    <TableHead className="text-right">AI Matches</TableHead>
                    <TableHead className="text-right">Discussions</TableHead>
                    <TableHead className="text-right">Deals</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                    <TableHead className="text-right">Last Login</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={member.full_name} />
                            <AvatarFallback className="text-xs">
                              {member.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={ROLE_COLORS[member.role]}
                        >
                          {ROLE_LABELS[member.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[member.status]}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {member.listings_posted}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.ai_matches_found}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.discussions_active}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.deals_completed}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(member.total_earnings))}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(member.last_login_at)}
                        {member.total_logins > 0 && (
                          <div className="text-xs">
                            ({member.total_logins} logins)
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(member)}
                            >
                              {member.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedMember(member);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.full_name}? This
              action cannot be undone and will delete all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
