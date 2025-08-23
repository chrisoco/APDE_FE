import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Badge } from "~/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import type { Landingpage } from "~/lib/types"

const truncateText = (text: string, maxLength: number = 50) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const landingpageColumns = (
  onEdit: (id: string) => void,
  onDelete: (landingpage: Landingpage) => void
): ColumnDef<Landingpage>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string
      return <div className="font-medium">{truncateText(title, 25)}</div>
    },
  },
  {
    id: "campaigns",
    header: "Campaigns",
    cell: ({ row }) => {
      const campaigns = row.original.campaigns || []
      if (campaigns.length === 0) {
        return <div className="text-muted-foreground text-sm">No campaigns</div>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {campaigns.map((campaign) => (
            <Badge key={campaign.id} variant="secondary" className="text-xs">
              {truncateText(campaign.title, 20)}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const landingpage = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            style={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              zIndex: 1000
            }}
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(landingpage.id.toString())}
            >
              Copy landing page ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(landingpage.id)}>
              Edit landing page
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete(landingpage)}
            >
              Delete landing page
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]