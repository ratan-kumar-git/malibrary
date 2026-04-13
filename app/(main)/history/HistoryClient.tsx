"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  History,
  Search,
  Filter,
  Download,
  ChevronRight,
  AlertCircle,
  Home,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface HistoryRecord {
  id: string;
  type: "NEW_BOOKING" | "RENEWAL" | "EXPIRY" | "PAYMENT" | "EDIT";
  studentName: string;
  memberId: number;
  studentId: string;
  seatNo: number;
  floorName: string;
  shifts: string[];
  amount: number;
  previousAmount?: number;
  status: "ACTIVE" | "EXPIRED";
  startDate: string;
  endDate: string;
  timestamp: string;
  description: string;
}

interface HistoryResponse {
  data: HistoryRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export default function HistoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [typeFilter, setTypeFilter] = useState(
    searchParams.get("type") || "ALL",
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "ALL",
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const pageSize = 10;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== "ALL" && { type: typeFilter }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });

      const res = await fetch(`/api/history?${params}`);
      if (!res.ok) throw new Error("Failed to fetch history");

      const data: HistoryResponse = await res.json();
      setRecords(data.data);
      setTotalRecords(data.total);
      setError("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load history";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, searchQuery, typeFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== "ALL" && { type: typeFilter }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        export: "true",
      });

      const res = await fetch(`/api/history?${params}`);
      if (!res.ok) throw new Error("Failed to export");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `history-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("History exported successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  };

  const getActivityBadge = (type: string) => {
    const config: Record<
      string,
      { label: string; variant: string; color: string }
    > = {
      NEW_BOOKING: {
        label: "New Booking",
        variant: "default",
        color: "bg-emerald-500/10 text-emerald-700",
      },
      RENEWAL: {
        label: "Renewal",
        variant: "default",
        color: "bg-blue-500/10 text-blue-700",
      },
      EXPIRY: {
        label: "Expiry",
        variant: "destructive",
        color: "bg-red-500/10 text-red-700",
      },
      PAYMENT: {
        label: "Payment",
        variant: "secondary",
        color: "bg-purple-500/10 text-purple-700",
      },
      EDIT: {
        label: "Edit",
        variant: "outline",
        color: "bg-orange-500/10 text-orange-700",
      },
    };

    const conf = config[type] || config.NEW_BOOKING;
    return <Badge className={conf.color}>{conf.label}</Badge>;
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">
                  <Home className="w-4 h-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary">History</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-4">
        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent >
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <Input
                    placeholder="Search student name, member ID, floor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Type Filter */}
                <Select
                  value={typeFilter}
                  onValueChange={(v) => {
                    setTypeFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="NEW_BOOKING">New Booking</SelectItem>
                    <SelectItem value="RENEWAL">Renewal</SelectItem>
                    <SelectItem value="EXPIRY">Expiry</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                    <SelectItem value="EDIT">Edit</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search Button */}
                <Button type="submit" className="gap-2">
                  <Filter size={16} />
                  Apply Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle size={20} />
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : records.length > 0 ? (
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Type</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Shifts</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>{getActivityBadge(record.type)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="font-semibold text-foreground">
                          {record.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          MID{String(record.memberId).padStart(4, "0")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-sm font-semibold">
                        {record.floorName} • Seat {record.seatNo}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {record.shifts.map((shift) => (
                          <Badge
                            key={shift}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {shift}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign
                          size={14}
                          className="text-muted-foreground"
                        />
                        <span className="font-semibold text-foreground">
                          ₹{record.amount.toLocaleString()}
                        </span>
                        {record.previousAmount && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{record.previousAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="text-muted-foreground">
                          {new Date(record.startDate).toLocaleDateString()}
                        </span>
                        <span className="text-muted-foreground">
                          to {new Date(record.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === "ACTIVE" ? "default" : "secondary"
                        }
                        className={
                          record.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-700"
                            : "bg-gray-500/20 text-gray-700"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() =>
                          router.push(`/student/${record.studentId}`)
                        }
                      >
                        View
                        <ChevronRight size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing {records.length} of {totalRecords} records
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    variant={page === i + 1 ? "default" : "outline"}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-12">
            <div className="text-center space-y-3">
              <History
                size={40}
                className="mx-auto text-muted-foreground opacity-50"
              />
              <p className="text-muted-foreground">No history records found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}