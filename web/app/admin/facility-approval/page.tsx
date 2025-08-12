'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FacilityApprovalService, FacilityApproval } from '@/services/facility-approval.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

function FacilityDetailsModal({
  open,
  onClose,
  facility,
  onApprove,
  onReject,
}: {
  open: boolean;
  onClose: () => void;
  facility?: FacilityApproval;
  onApprove: (comment?: string) => void;
  onReject: (comment?: string) => void;
}) {
  const [comment, setComment] = useState('');
  useEffect(() => {
    setComment('');
  }, [open]);
  if (!facility) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Facility Details</DialogTitle>
        </DialogHeader>
        <div className='space-y-2'>
          <div className='text-lg font-bold'>{facility.name}</div>
          <div className='text-muted-foreground text-sm'>{facility.address}</div>
          <div className='text-sm'>
            Owner: {facility.owner.name} ({facility.owner.email})
          </div>
          <div className='text-sm'>{facility.description}</div>
          <div className='flex gap-2 overflow-x-auto py-2'>
            {facility.photos?.map((p) => (
              <Image
                key={p.id}
                src={p.url}
                alt={p.caption || 'photo'}
                className='h-24 w-32 rounded border object-cover'
              />
            ))}
          </div>
          <Input placeholder='Optional comment' value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <DialogFooter className='flex gap-2'>
          <Button onClick={() => onApprove(comment)} className='bg-green-600 hover:bg-green-700'>
            <Check className='mr-2 h-4 w-4' />
            Approve
          </Button>
          <Button onClick={() => onReject(comment)} variant='destructive'>
            <X className='mr-2 h-4 w-4' />
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FacilityApprovalPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<FacilityApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FacilityApproval | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    const res = await FacilityApprovalService.listPending();
    setFacilities(res.data?.data || []);
    setLoading(false);
  };
  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleApprove = async (id: string, comment?: string) => {
    await FacilityApprovalService.approve(id, comment);
    setFacilities((prev) => prev.filter((f) => f.id !== id));
    setModalOpen(false);
  };
  const handleReject = async (id: string, comment?: string) => {
    await FacilityApprovalService.reject(id, comment);
    setFacilities((prev) => prev.filter((f) => f.id !== id));
    setModalOpen(false);
  };

  return (
    <div className='bg-primary/5 min-h-screen px-2 py-8 md:px-8'>
      <div className='mx-auto max-w-5xl space-y-8'>
        <div className='mb-2 flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            &larr; Back
          </Button>
          <h1 className='text-primary text-3xl font-bold'>Facility Approval</h1>
        </div>
        <Card className='shadow-xl'>
          <CardHeader>
            <CardTitle>Pending Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className='mx-auto animate-spin' />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.owner.name}</TableCell>
                      <TableCell>{f.address}</TableCell>
                      <TableCell>{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={async () => {
                            setSelected(f);
                            setModalOpen(true);
                          }}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          size='icon'
                          className='ml-1 bg-green-600 text-white hover:bg-green-700'
                          onClick={() => handleApprove(f.id)}
                        >
                          <Check className='h-4 w-4' />
                        </Button>
                        <Button size='icon' variant='destructive' className='ml-1' onClick={() => handleReject(f.id)}>
                          <X className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <FacilityDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          facility={selected || undefined}
          onApprove={(c) => selected && handleApprove(selected.id, c)}
          onReject={(c) => selected && handleReject(selected.id, c)}
        />
      </div>
    </div>
  );
}
