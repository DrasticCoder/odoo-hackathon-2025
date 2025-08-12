"use client";
import { useEffect, useState } from "react";
import { FacilityApprovalHistoryService } from "@/services/facility-approval-history.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
type FacilityHistory = {
  id: string;
  name: string;
  address?: string;
  status: string;
  owner?: { id: string; name: string; email?: string };
  photos?: { id: string; url: string; caption?: string }[];
  description?: string;
  createdAt: string;
};

export default function FacilityApprovalHistoryPage() {
  const [facilities, setFacilities] = useState<FacilityHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FacilityHistory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    const res = await FacilityApprovalHistoryService.list({ status: undefined });
    setFacilities(res.data?.data || []);
    setLoading(false);
  };
  useEffect(() => { fetchFacilities(); }, []);

  return (
    <div className="min-h-screen bg-primary/5 py-8 px-2 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold text-primary">Facility Approval History</h1>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>All Facilities (Approved/Rejected)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.owner?.name}</TableCell>
                      <TableCell><Badge>{f.status}</Badge></TableCell>
                      <TableCell>{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={async () => { setSelected(f); setModalOpen(true); }}><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Dialog open={modalOpen} onOpenChange={() => setModalOpen(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Facility Details</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-2">
                <div className="font-bold text-lg">{selected.name}</div>
                <div className="text-sm text-muted-foreground">{selected.address}</div>
                <div className="text-sm">Owner: {selected.owner?.name} ({selected.owner?.email})</div>
                <div className="text-sm">{selected.description}</div>
                <div className="flex gap-2 overflow-x-auto py-2">
                  {selected.photos?.map((p) => (
                    <Image key={p.id} src={p.url} alt={p.caption || "photo"} width={128} height={96} className="h-24 w-32 object-cover rounded border" />
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
