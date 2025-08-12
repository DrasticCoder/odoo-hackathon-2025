"use client";
import { useEffect, useState } from "react";
import { Activity } from "@/services/activity.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Edit2, Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function ActivityForm({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (a: Partial<Activity>) => void; initial?: Partial<Activity> }) {
	const [type, setType] = useState(initial?.type || "");
	const [description, setDescription] = useState(initial?.description || "");
	useEffect(() => { setType(initial?.type || ""); setDescription(initial?.description || ""); }, [initial, open]);
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{initial?.id ? "Edit Activity" : "Add Activity"}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<Input placeholder="Type (e.g. Facility Approved)" value={type} onChange={e => setType(e.target.value)} />
					<Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
				</div>
				<DialogFooter>
					<Button onClick={() => onSave({ type, description })}>{initial?.id ? "Update" : "Create"}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default function ActivityPage() {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editActivity, setEditActivity] = useState<Activity | null>(null);

	const fetchActivities = async () => {
		setLoading(true);
		// TODO: Replace with real API call
		const mock: Activity[] = [
			{ id: "1", type: "Facility Approved", description: "SportZone Arena approved", user: { id: "u1", name: "Admin" }, createdAt: new Date().toISOString() },
			{ id: "2", type: "User Registered", description: "john@example.com joined", user: { id: "u2", name: "John" }, createdAt: new Date(Date.now() - 3600*1000).toISOString() },
		];
		setActivities(mock);
		setLoading(false);
		// Uncomment for real API:
		// const res = await ActivityService.list();
		// setActivities(res.data.data);
		// setLoading(false);
	};

	useEffect(() => { fetchActivities(); }, []);

	const handleDelete = async (id: string) => {
		// await ActivityService.remove(id);
		setActivities((prev) => prev.filter((a) => a.id !== id));
	};
	const handleSave = async (data: Partial<Activity>) => {
		if (editActivity) {
			// await ActivityService.update(editActivity.id, data);
			setActivities((prev) => prev.map((a) => a.id === editActivity.id ? { ...a, ...data } : a));
		} else {
			// const res = await ActivityService.create(data);
			setActivities((prev) => [{ id: Math.random().toString(), ...data, user: { id: "u1", name: "Admin" }, createdAt: new Date().toISOString() } as Activity, ...prev]);
		}
		setShowForm(false); setEditActivity(null);
	};

	return (
		<div className="min-h-screen bg-primary/5 py-8 px-2 md:px-8">
			<div className="mx-auto max-w-5xl space-y-8">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold text-primary">Activity Log</h1>
					<Button onClick={() => { setShowForm(true); setEditActivity(null); }} className="bg-orange-500 hover:bg-orange-600"><Plus className="mr-2 h-4 w-4" />Add Activity</Button>
				</div>
				<Card className="shadow-xl">
					<CardHeader>
						<CardTitle>Recent Activities</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? <Loader2 className="animate-spin mx-auto" /> : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{activities.map((a) => (
										<TableRow key={a.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													<Avatar className="h-8 w-8"><AvatarImage src={a.user.avatarUrl} /><AvatarFallback>{a.user.name[0]}</AvatarFallback></Avatar>
													<span>{a.user.name}</span>
												</div>
											</TableCell>
											<TableCell><Badge>{a.type}</Badge></TableCell>
											<TableCell>{a.description}</TableCell>
											<TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
											<TableCell>
												<Button size="icon" variant="ghost" onClick={() => { setEditActivity(a); setShowForm(true); }}><Edit2 className="h-4 w-4" /></Button>
												<Button size="icon" variant="destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4" /></Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
				<ActivityForm open={showForm} onClose={() => { setShowForm(false); setEditActivity(null); }} onSave={handleSave} initial={editActivity || undefined} />
			</div>
		</div>
	);
}
