"use client";
import { useEffect, useState } from "react";
import { ReportsService, Report } from "@/services/reports.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, User as UserIcon, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
type OwnerFacility = { id: string; name: string; address?: string; photos?: { url: string }[] };
type OwnerInfo = { name: string; email: string; avatarUrl?: string; facilities?: OwnerFacility[] };
type OwnerReport = Report & { owner?: OwnerInfo };

export default function ReportsModerationPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const res = await ReportsService.list();
  setReports(res.data?.data || []);
    setLoading(false);
  };
  useEffect(() => { fetchReports(); }, []);

  const handleAction = async (id: string, status: string) => {
    // await ReportsService.action(id, status);
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  // Separate user and owner reports
  const userReports = reports.filter(r => r.targetType === "User");
  // For mock data, ownerReports may have extra 'owner' property
  const ownerReports: OwnerReport[] = reports.filter(r => r.targetType === "Owner") as OwnerReport[];

  return (
    <div className="min-h-screen bg-primary/5 py-8 px-2 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>&larr; Back</Button>
          <h1 className="text-3xl font-bold text-primary">Reports Moderation</h1>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Submitted Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (
              <div className="space-y-8">
                {/* User Reports Table */}
                {userReports.length > 0 && <>
                  <div className="font-semibold text-lg flex items-center gap-2 mb-2"><UserIcon className="h-5 w-5" /> User Reports</div>
                  <Table className="mb-8">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userReports.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.reporter.name}</TableCell>
                          <TableCell>{r.targetType} ({r.targetId})</TableCell>
                          <TableCell>{r.reason}</TableCell>
                          <TableCell><Badge>{r.status}</Badge></TableCell>
                          <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button size="icon" className="bg-green-600 hover:bg-green-700 text-white mr-1" onClick={() => handleAction(r.id, "ACTIONED") }><Check className="h-4 w-4" /></Button>
                            <Button size="icon" variant="destructive" onClick={() => handleAction(r.id, "CLOSED") }><X className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>}
                {/* Owner Reports Table with details */}
                {ownerReports.length > 0 && <>
                  <div className="font-semibold text-lg flex items-center gap-2 mb-2"><Building2 className="h-5 w-5" /> Owner Reports</div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {ownerReports.map((r) => (
                      <div key={r.id} className="border rounded-lg p-4 bg-white flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                            <Image src={r.owner?.avatarUrl || "/heizen.png"} alt={r.owner?.name || "Owner"} width={48} height={48} className="h-12 w-12 object-cover" />
                          </span>
                          <div>
                            <div className="font-bold text-lg">{r.owner?.name || "Owner"}</div>
                            <div className="text-sm text-muted-foreground">{r.owner?.email}</div>
                          </div>
                        </div>
                        <div className="text-sm mt-2"><span className="font-semibold">Reason:</span> {r.reason}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(r.owner?.facilities) && r.owner.facilities.map((f) => (
                            <div key={f.id} className="border rounded p-2 flex flex-col items-center w-32">
                              <Image src={f.photos?.[0]?.url || "/heizen.png"} alt={f.name} width={112} height={64} className="h-16 w-28 object-cover rounded mb-1" />
                              <div className="font-medium text-xs text-center">{f.name}</div>
                              <div className="text-xs text-muted-foreground">{f.address}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge>{r.status}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(r.id, "ACTIONED") }>Action</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction(r.id, "CLOSED") }>Close</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>}
                {userReports.length === 0 && ownerReports.length === 0 && <div className="text-muted-foreground">No reports found.</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
