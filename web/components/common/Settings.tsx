'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import { AuthService } from '@/services/auth.service';
import { UsersService } from '@/services/users.service';
import { FacilitiesService, type Facility } from '@/services/facilities.service';
import { useAuthStore } from '@/store';
import { User } from '@/types/auth.type';
import MediaUploader from '@/components/common/media-uploader';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Settings() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myFacilities, setMyFacilities] = useState<Facility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  const fallback = useMemo(() => user?.name?.charAt(0)?.toUpperCase() || 'U', [user?.name]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', avatarUrl: user?.avatarUrl ?? '' },
  });

  useEffect(() => {
    const init = async () => {
      try {
        const res = await AuthService.getMe();
        if (res.data?.user) {
          reset({ name: res.data.user.name ?? '', avatarUrl: res.data.user.avatarUrl ?? '' });
          if (!user) setUser(res.data.user as User);
        }
        // Owner: fetch own facilities
        if ((user?.role || res.data?.user?.role) === 'OWNER') {
          setLoadingFacilities(true);
          const f = await FacilitiesService.listMine();
          if (f.data) setMyFacilities(f.data.data || []);
          setLoadingFacilities(false);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: ProfileForm) => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const resp = await UsersService.update(user.id, values);
      if (resp.data) {
        setUser(resp.data);
        toast.success('Profile updated');
        reset({ name: resp.data.name ?? '', avatarUrl: resp.data.avatarUrl ?? '' });
      } else if (resp.error) {
        toast.error(resp.error.message || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (fileOrUrl: File | string) => {
    if (!user?.id) return;
    console.log('handleAvatarSelect', fileOrUrl);
    // Our MediaUploader returns URL(s) via Cloudinary, so we only need the URL (if File, the component uploads and gives back URLs already)
    if (typeof fileOrUrl === 'string') {
      setSaving(true);
      const resp = await UsersService.update(user.id, { avatarUrl: fileOrUrl });
      if (resp.data) {
        setUser(resp.data);
        reset({ name: resp.data.name ?? '', avatarUrl: resp.data.avatarUrl ?? '' });
        toast.success('Avatar updated');
      } else if (resp.error) {
        toast.error(resp.error.message || 'Failed to update avatar');
      }
      setSaving(false);
    }
  };

  const removeFacility = async (id: string) => {
    const resp = await FacilitiesService.remove(id);
    if ('error' in resp && resp.error) {
      toast.error('Failed to remove facility');
      return;
    }
    setMyFacilities((prev) => prev.filter((f) => f.id !== id));
    toast.success('Facility removed');
  };

  const onLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500' />
      </div>
    );
  }

  return (
    <div className='bg-background mx-auto w-full max-w-3xl p-4 sm:p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src={user?.avatarUrl || ''} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className='text-sm text-gray-600'>
              <div className='font-medium text-gray-900'>{user?.email}</div>
              <div>Role: {user?.role}</div>
              {user?.isVerified ? (
                <div className='text-green-600'>Verified</div>
              ) : (
                <div className='text-amber-600'>Not verified</div>
              )}
            </div>
          </div>

          <Separator className='my-6' />

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input id='name' placeholder='Your name' {...register('name')} />
              {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='avatarUrl'>Avatar</Label>

              {errors.avatarUrl && <p className='text-sm text-red-500'>{errors.avatarUrl.message}</p>}
              <div className='pt-2'>
                <MediaUploader
                  onUpload={(urls) => {
                    const first = urls?.[0];
                    if (first) handleAvatarSelect(first);
                  }}
                  folderName='avatars'
                  multiple={false}
                />
              </div>
            </div>

            <div className='flex flex-col gap-3 pt-2 sm:flex-row sm:items-center'>
              <Button type='submit' disabled={saving || !isDirty} className='bg-orange-500 hover:bg-orange-600'>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type='button' variant='outline' onClick={() => reset()} disabled={saving || !isDirty}>
                Reset
              </Button>
              <div className='sm:ml-auto' />
              <Button type='button' variant='destructive' onClick={onLogout}>
                Logout
              </Button>
            </div>
          </form>

          {user?.role === 'OWNER' && (
            <>
              <Separator className='my-6' />
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold'>Facilities</h3>
                <p className='text-muted-foreground text-sm'>
                  Create or update your facilities from the owner dashboard.
                </p>
                <div className='flex flex-wrap gap-3'>
                  <Button onClick={() => router.push('/owner/facilities/add')} variant='secondary'>
                    Add Facility
                  </Button>
                  <Button onClick={() => router.push('/owner/dashboard')} variant='outline'>
                    Go to Owner Dashboard
                  </Button>
                </div>
                <div className='mt-4'>
                  {loadingFacilities ? (
                    <div className='text-muted-foreground text-sm'>Loading facilities...</div>
                  ) : myFacilities.length === 0 ? (
                    <div className='text-muted-foreground text-sm'>No facilities yet.</div>
                  ) : (
                    <ul className='divide-y rounded-md border'>
                      {myFacilities.map((fac) => (
                        <li key={fac.id} className='flex items-center justify-between gap-3 p-3'>
                          <div>
                            <div className='font-medium'>{fac.name}</div>
                            <div className='text-muted-foreground text-xs'>{fac.shortLocation || fac.address}</div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => router.push(`/owner/facilities/${fac.id}`)}
                            >
                              Edit
                            </Button>
                            <Button size='sm' variant='destructive' onClick={() => removeFacility(fac.id)}>
                              Remove
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Separator className='my-6' />
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold'>Admin Controls</h3>
                <p className='text-muted-foreground text-sm'>
                  You can manage all users and facilities from the admin dashboard. To change your own credentials, use
                  the fields above. For other users, go to User Management.
                </p>
                <div className='flex flex-wrap gap-3'>
                  <Button onClick={() => router.push('/admin/dashboard')} variant='outline'>
                    Go to Admin Dashboard
                  </Button>
                  <Button onClick={() => router.push('/admin/users')} variant='secondary'>
                    Manage Users
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
