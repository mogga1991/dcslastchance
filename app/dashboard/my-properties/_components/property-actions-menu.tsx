"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, Eye, Archive } from "lucide-react";
import Link from "next/link";

interface PropertyActionsMenuProps {
  propertyId: string;
  propertyStatus: string;
  onDelete: () => void;
  onViewMatches: () => void;
  disabled?: boolean;
}

export default function PropertyActionsMenu({
  propertyId,
  propertyStatus,
  onDelete,
  onViewMatches,
  disabled = false,
}: PropertyActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          className="h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-md border border-gray-200"
        >
          <MoreVertical className="h-5 w-5 text-gray-700" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/my-properties/${propertyId}/edit`}
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewMatches}>
          <Eye className="h-4 w-4 mr-2" />
          View Matches
        </DropdownMenuItem>
        {propertyStatus === "active" && (
          <DropdownMenuItem>
            <Archive className="h-4 w-4 mr-2" />
            Mark Inactive
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
