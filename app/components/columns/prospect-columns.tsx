"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import type { Prospect } from "../../lib/types"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const prospectColumns: ColumnDef<Prospect>[] = [
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
    accessorKey: "image",
    header: "Avatar",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image") as string
      return (
        <div className="flex h-10 w-10">
          <img 
            src={imageUrl} 
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
      )
    },
  },
  {
    accessorKey: "gender",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gender
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string
      return (
        <div className="flex w-[100px]">
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            gender === 'male' 
              ? 'bg-blue-50 text-blue-700 ring-blue-600/20' 
              : 'bg-pink-50 text-pink-700 ring-pink-600/20'
          }`}>
            {gender.charAt(0).toUpperCase() + gender.slice(1)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "age",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Age
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="text-muted-foreground">{row.getValue("age")}</div>
    },
  },
  {
    accessorKey: "birthDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Birth Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("birthDate") as string
      return <div className="text-muted-foreground">{formatDate(date)}</div>
    },
  },
  {
    header: "Location",
    cell: ({ row }) => {
      const prospect = row.original
      return (
        <div className="text-muted-foreground">
          {prospect.address.city}, {prospect.address.state}
        </div>
      )
    },
  },
  {
    header: "Physical",
    cell: ({ row }) => {
      const prospect = row.original
      return (
        <div className="text-muted-foreground">
          {Math.round(prospect.height)}cm / {Math.round(prospect.weight)}kg
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const prospect = row.original

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
              onClick={() => navigator.clipboard.writeText(prospect.id.toString())}
            >
              Copy prospect ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View prospect</DropdownMenuItem>
            <DropdownMenuItem>Edit prospect</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete prospect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]