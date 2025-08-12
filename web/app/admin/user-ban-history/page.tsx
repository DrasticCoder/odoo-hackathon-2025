"use client";
import { useEffect, useState, useCallback } from "react";
import { UserBanHistoryService } from "@/services/user-ban-history.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { UserManagementService } from "@/services/user-management.service";

type BannedUser = { id: string; name: string; email: string };
type BanRecord = { id: string; user: BannedUser; reason?: string; createdAt: string; bannedBy?: { id: string; name: string } };

export default function UserBanHistoryPage() {
  const [bans, setBans] = useState<BanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BanRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unbanLoading, setUnbanLoading] = useState<string | null>(null);

  const handleUnban = async (userId: string) => {
    setUnbanLoading(userId);
    await UserManagementService.unban(userId);
    setUnbanLoading(null);
    setBans((prev: BanRecord[]) => prev.filter((b: BanRecord) => b.user?.id !== userId));
  };

  type RawBan = {
    id?: string;
    _id?: string;
    user?: { id?: string; name?: string; email?: string };
    name?: string;
    email?: string;
    reason?: string;
    banReason?: string;
    createdAt?: string;
    bannedAt?: string;
    bannedBy?: { id: string; name: string };
  };

  const fetchBans = useCallback(async (reset = false) => {
    setLoading(true);
    const res = await UserBanHistoryService.list({ page, limit: 5 });
    const newBans: BanRecord[] = ((res.data?.data || []) as RawBan[]).map((u) => ({
      id: (u.id || u._id || u.user?.id || "unknown") + "-ban",
      user: { id: u.user?.id || u.id || "", name: u.user?.name || u.name || "", email: u.user?.email || u.email || "" },
      reason: u.reason || u.banReason,
      createdAt: u.createdAt || u.bannedAt || new Date().toISOString(),
      bannedBy: u.bannedBy,
    }));
    setBans((prev) => (reset ? newBans : [...prev, ...newBans]));
    setHasMore(newBans.length === 5);
    setLoading(false);
  }, [page]);
  useEffect(() => { fetchBans(true); }, [page, fetchBans]);

  return (
    <div className="min-h-screen bg-primary/5 py-8 px-2 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold text-primary">User Ban History</h1>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>All Banned Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && bans.length === 0 ? <Loader2 className="animate-spin mx-auto" /> : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bans.map((b) => (
                      <TableRow key={b.id} className="cursor-pointer hover:bg-primary/10" onClick={() => { setSelected(b); setModalOpen(true); }}>
                        <TableCell>{b.user?.name}</TableCell>
                        <TableCell>{b.user?.email}</TableCell>
                        <TableCell className="max-w-xs truncate" title={b.reason}>{b.reason}</TableCell>
                        <TableCell><Badge variant="destructive">Banned</Badge></TableCell>
                        <TableCell>{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setSelected(b); setModalOpen(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" disabled={unbanLoading === b.user?.id} onClick={e => { e.stopPropagation(); handleUnban(b.user?.id); }} title="Unban user">
                              {unbanLoading === b.user?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4 text-green-600" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {hasMore && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => setPage(page + 1)} disabled={loading}>Load More</Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <Dialog open={modalOpen} onOpenChange={() => setModalOpen(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>User Ban Details</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-2">
                <div className="font-bold text-lg">{selected.user?.name}</div>
                <div className="text-sm text-muted-foreground">{selected.user?.email}</div>
                <div className="text-sm">Reason: {selected.reason}</div>
                <div className="text-sm">Banned At: {new Date(selected.createdAt).toLocaleString()}</div>
                <div className="text-sm">Banned By: {selected.bannedBy?.name}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
