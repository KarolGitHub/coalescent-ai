'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Plus, UsersRound, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE = 6;

type SortOption = 'newest' | 'oldest' | 'az' | 'za';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const getUserAndCustomers = async () => {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      setUserId(uid || null);
      if (!uid) {
        setCustomers([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, created_at')
        .eq('created_by', uid);
      if (error) setError(error.message);
      else setCustomers(data || []);
      setLoading(false);
    };
    getUserAndCustomers();
  }, []);

  // Sorting
  const sortedCustomers = [...customers].sort((a, b) => {
    if (sort === 'newest') return b.created_at.localeCompare(a.created_at);
    if (sort === 'oldest') return a.created_at.localeCompare(b.created_at);
    if (sort === 'az') return a.name.localeCompare(b.name);
    if (sort === 'za') return b.name.localeCompare(a.name);
    return 0;
  });

  // Filter and paginate
  const filteredCustomers = sortedCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE)
  );
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setError('You must be signed in to add a customer.');
      setCreating(false);
      return;
    }
    const { data, error } = await supabase
      .from('customers')
      .insert([{ name, email, phone, created_by: userId }])
      .select('id, name, email, phone, created_at')
      .single();
    if (error) setError(error.message);
    else if (data) setCustomers((prev) => [data, ...prev]);
    setName('');
    setEmail('');
    setPhone('');
    setCreating(false);
  };

  // Edit
  const openEditDialog = (c: Customer) => {
    setEditId(c.id);
    setEditName(c.name);
    setEditEmail(c.email || '');
    setEditPhone(c.phone || '');
    setDialogOpen(true);
  };
  const handleEdit = async () => {
    if (!editId || !editName.trim()) return;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('customers')
      .update({ name: editName, email: editEmail, phone: editPhone })
      .eq('id', editId)
      .select('id, name, email, phone, created_at')
      .single();
    if (error) setError(error.message);
    else if (data)
      setCustomers((prev) =>
        prev.map((c) => (c.id === editId ? { ...c, ...data } : c))
      );
    setDialogOpen(false);
    setEditId(null);
    setEditName('');
    setEditEmail('');
    setEditPhone('');
  };

  // Delete
  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };
  const handleDelete = async () => {
    if (!deletingId) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', deletingId);
    if (error) setError(error.message);
    else setCustomers((prev) => prev.filter((c) => c.id !== deletingId));
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <div className='max-w-2xl mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6 flex items-center gap-2'>
        <UsersRound className='w-7 h-7 text-primary' /> Customers
      </h1>
      <form
        onSubmit={handleCreate}
        className='flex flex-col sm:flex-row gap-2 mb-8'
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Customer name'
          className='flex-1'
          disabled={creating}
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          className='flex-1'
          disabled={creating}
        />
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder='Phone'
          className='flex-1'
          disabled={creating}
        />
        <Button type='submit' disabled={creating || !name.trim()}>
          <Plus className='w-4 h-4 mr-1' /> Add
        </Button>
      </form>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4'>
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder='Search customers...'
          className='w-full sm:w-64'
        />
        <div className='flex items-center gap-2'>
          <label htmlFor='sort' className='text-sm text-muted-foreground'>
            Sort:
          </label>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className='w-32 h-9'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='newest'>Newest</SelectItem>
              <SelectItem value='oldest'>Oldest</SelectItem>
              <SelectItem value='az'>Name A-Z</SelectItem>
              <SelectItem value='za'>Name Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <div className='mb-4 text-red-600'>{error}</div>}
      {!userId ? (
        <div className='text-muted-foreground'>
          Sign in to view your customers.
        </div>
      ) : loading ? (
        <div>Loading...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className='text-muted-foreground'>No customers found.</div>
      ) : (
        <>
          <div className='grid gap-4'>
            {paginatedCustomers.map((c) => (
              <Card
                key={c.id}
                className='flex flex-row items-center justify-between p-4'
              >
                <div>
                  <CardTitle className='text-lg mb-1'>{c.name}</CardTitle>
                  <CardDescription className='text-xs'>
                    {c.email && <span className='mr-2'>📧 {c.email}</span>}
                    {c.phone && <span>📞 {c.phone}</span>}
                  </CardDescription>
                  <CardDescription className='text-xs mt-1'>
                    Created {new Date(c.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Edit'
                    onClick={() => openEditDialog(c)}
                  >
                    <Pencil className='w-4 h-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Delete'
                    onClick={() => openDeleteDialog(c.id)}
                  >
                    <Trash2 className='w-4 h-4 text-red-500' />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className='flex justify-center items-center gap-4 mt-6'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className='text-sm text-muted-foreground'>
              Page {page} of {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder='Customer name'
            autoFocus
          />
          <Input
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder='Email'
            className='mt-2'
          />
          <Input
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder='Phone'
            className='mt-2'
          />
          <DialogFooter>
            <Button onClick={handleEdit} disabled={!editName.trim()}>
              Save
            </Button>
            <DialogClose asChild>
              <Button variant='outline' type='button'>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this customer? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
            <DialogClose asChild>
              <Button variant='outline' type='button'>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
