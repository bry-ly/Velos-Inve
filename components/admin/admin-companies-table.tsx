"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  IconSearch,
  IconPackage,
  IconChevronLeft,
  IconChevronRight,
  IconBuilding,
  IconUsers,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

interface Company {
  id: string;
  name: string;
  email: string | null;
  logo: string | null;
  industry: string | null;
  teamSize: string | null;
  createdAt: Date;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  productCount: number;
  totalUnits: number;
}

interface AdminCompaniesTableProps {
  companies: Company[];
  page: number;
  totalPages: number;
  total: number;
  search: string;
  industryFilter: string;
  industries: string[];
}

// Industry labels mapping
const industryLabels: Record<string, string> = {
  retail: "Retail & E-commerce",
  manufacturing: "Manufacturing",
  technology: "Technology",
  healthcare: "Healthcare",
  food_beverage: "Food & Beverage",
  automotive: "Automotive",
  construction: "Construction",
  logistics: "Logistics & Shipping",
  electronics: "Electronics",
  agriculture: "Agriculture",
  fashion: "Fashion & Apparel",
  other: "Other",
};

export function AdminCompaniesTable({
  companies,
  page,
  totalPages,
  total,
  search,
  industryFilter,
  industries,
}: AdminCompaniesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);

  const updateQueryParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (!updates.page) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchValue });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name or email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        <Select
          value={industryFilter || "all"}
          onValueChange={(value) => updateQueryParams({ industry: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industryLabels[industry] || industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Team Size</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 rounded-md">
                        {company.logo ? (
                          <AvatarImage src={company.logo} />
                        ) : (
                          <AvatarFallback className="rounded-md">
                            <IconBuilding className="size-5 text-muted-foreground" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        {company.email && (
                          <p className="text-xs text-muted-foreground">
                            {company.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage src={company.user.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {company.user.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{company.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.industry ? (
                      <Badge variant="outline">
                        {industryLabels[company.industry] || company.industry}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.teamSize ? (
                      <div className="flex items-center gap-1">
                        <IconUsers className="size-4 text-muted-foreground" />
                        <span>{company.teamSize}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IconPackage className="size-4 text-muted-foreground" />
                      <span>{company.productCount}</span>
                      <span className="text-muted-foreground text-xs">
                        ({company.totalUnits.toLocaleString()} units)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(company.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of{" "}
          {total} companies
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQueryParams({ page: String(page - 1) })}
            disabled={page <= 1}
          >
            <IconChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQueryParams({ page: String(page + 1) })}
            disabled={page >= totalPages}
          >
            Next
            <IconChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
