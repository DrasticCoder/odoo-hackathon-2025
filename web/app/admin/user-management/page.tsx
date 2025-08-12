"use client";
import { useEffect, useState } from "react";
import { UserManagementService } from "@/services/user-management.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Ban, Undo2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type UserRow = { id: string; name: string; email: string; role: 'ADMIN'|'OWNER'|'USER'; isActive: boolean };
type UserBooking = { id: string; facility?: { name: string }; court?: { name: string }; startDatetime: string; status: string };

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banLoading, setBanLoading] = useState(false);
  const [banTarget, setBanTarget] = useState<UserRow | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let isActive: boolean | undefined = undefined;
    if (status === "active") isActive = true;
    else if (status === "inactive") isActive = false;
    const res = await UserManagementService.list({
      q: search,
      role: role === "all" ? undefined : role,
      isActive
    });
  setUsers((res.data?.data || []) as UserRow[]);
    setLoading(false);
  }, [search, role, status]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async () => {
    if (!banTarget) return;
    setBanLoading(true);
    await UserManagementService.ban(banTarget.id, banReason);
    setBanLoading(false);
    setBanDialogOpen(false);
    setBanReason("");
    setBanTarget(null);
    fetchUsers();
    window.dispatchEvent(new Event('user-ban-updated'));
  };
  const handleUnban = async (id: string) => {
    await UserManagementService.unban(id);
    fetchUsers();
    window.dispatchEvent(new Event('user-ban-updated'));
  };
  const handleViewBookings = async (user: UserRow) => {
    setSelectedUser(user);
    setShowBookings(true);
    const res = await UserManagementService.getBookings(user.id);
  setBookings((res.data?.data || []) as UserBooking[]);
  };

  return (
    <div className="min-h-screen bg-primary/5 py-8 px-2 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>&larr; Back</Button>
          <h1 className="text-3xl font-bold text-primary">User Management</h1>
        </div>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="max-w-xs w-36">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="OWNER">OWNER</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="max-w-xs w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge>{u.role}</Badge></TableCell>
                      <TableCell>{u.isActive ? <Badge className="bg-green-100 text-green-700">Active</Badge> : <Badge className="bg-red-100 text-red-700">Inactive</Badge>}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleViewBookings(u)}><Eye className="h-4 w-4" /></Button>
                        {u.isActive ? (
                          u.role === "ADMIN" ? (
                            <Button size="icon" variant="destructive" disabled title="Cannot ban another admin"><Ban className="h-4 w-4 opacity-50" /></Button>
                          ) : (
                            <Button size="icon" variant="destructive" onClick={() => { setBanTarget(u); setBanDialogOpen(true); }}><Ban className="h-4 w-4" /></Button>
                          )
                        ) : (
                          <Button size="icon" className="bg-green-600 hover:bg-green-700 text-white ml-1" onClick={() => handleUnban(u.id)}><Undo2 className="h-4 w-4" /></Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Dialog open={showBookings} onOpenChange={() => setShowBookings(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking History for {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {bookings.length === 0 ? <div className="text-muted-foreground">No bookings found.</div> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facility</TableHead>
                      <TableHead>Court</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.facility?.name}</TableCell>
                        <TableCell>{b.court?.name}</TableCell>
                        <TableCell>{new Date(b.startDatetime).toLocaleString()}</TableCell>
                        <TableCell><Badge>{b.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowBookings(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban Reason Dialog (only show reason form when banning) */}
        {/* Ban Reason Dialog - rewritten logic */}
        <Dialog open={banDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setBanDialogOpen(false);
            setBanReason("");
            setBanTarget(null);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{banTarget ? `Ban ${banTarget.name}` : "Ban User"}</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <label className="block text-sm font-medium mb-1">Reason</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder="Enter reason for ban"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setBanDialogOpen(false);
                setBanReason("");
                setBanTarget(null);
              }}>Cancel</Button>
              <Button className="bg-destructive text-white" onClick={handleBan} disabled={!banReason.trim() || banLoading}>
                {banLoading ? "Banning..." : "Ban"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
