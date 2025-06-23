'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Plus, Ticket, Pencil, Trash2 } from 'lucide-react';
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
type Status = 'open' | 'in_progress' | 'closed';

interface TicketType {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  created_at: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('open');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<Status>('open');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const getUserAndTickets = async () => {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      setUserId(uid || null);
      if (!uid) {
        setTickets([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('tickets')
        .select('id, title, description, status, created_at')
        .eq('created_by', uid);
      if (error) setError(error.message);
      else setTickets(data || []);
      setLoading(false);
    };
    getUserAndTickets();
  }, []);

  // Sorting
  const sortedTickets = [...tickets].sort((a, b) => {
    if (sort === 'newest') return b.created_at.localeCompare(a.created_at);
    if (sort === 'oldest') return a.created_at.localeCompare(b.created_at);
    if (sort === 'az') return a.title.localeCompare(b.title);
    if (sort === 'za') return b.title.localeCompare(a.title);
    return 0;
  });

  // Filter and paginate
  const filteredTickets = sortedTickets.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setError('You must be signed in to add a ticket.');
      setCreating(false);
      return;
    }
    const { data, error } = await supabase
      .from('tickets')
      .insert([{ title, description, status, created_by: userId }])
      .select('id, title, description, status, created_at')
      .single();
    if (error) setError(error.message);
    else if (data) setTickets((prev) => [data, ...prev]);
    setTitle('');
    setDescription('');
    setStatus('open');
    setCreating(false);
  };

  // Edit
  const openEditDialog = (t: TicketType) => {
    setEditId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description || '');
    setEditStatus(t.status);
    setDialogOpen(true);
  };
  const handleEdit = async () => {
    if (!editId || !editTitle.trim()) return;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('tickets')
      .update({
        title: editTitle,
        description: editDescription,
        status: editStatus,
      })
      .eq('id', editId)
      .select('id, title, description, status, created_at')
      .single();
    if (error) setError(error.message);
    else if (data)
      setTickets((prev) =>
        prev.map((t) => (t.id === editId ? { ...t, ...data } : t))
      );
    setDialogOpen(false);
    setEditId(null);
    setEditTitle('');
    setEditDescription('');
    setEditStatus('open');
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
      .from('tickets')
      .delete()
      .eq('id', deletingId);
    if (error) setError(error.message);
    else setTickets((prev) => prev.filter((t) => t.id !== deletingId));
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <div className='max-w-2xl mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6 flex items-center gap-2'>
        <Ticket className='w-7 h-7 text-primary' /> Tickets
      </h1>
      <form onSubmit={handleCreate} className='flex flex-col gap-2 mb-8'>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Ticket title'
          className='flex-1'
          disabled={creating}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Description'
          className='flex-1'
          disabled={creating}
        />
        <div className='flex gap-2 items-center'>
          <label className='text-sm text-muted-foreground'>Status:</label>
          <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
            <SelectTrigger className='w-40 h-9'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='open'>Open</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
              <SelectItem value='closed'>Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button type='submit' disabled={creating || !title.trim()}>
            <Plus className='w-4 h-4 mr-1' /> Add
          </Button>
        </div>
      </form>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4'>
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder='Search tickets...'
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
              <SelectItem value='az'>Title A-Z</SelectItem>
              <SelectItem value='za'>Title Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <div className='mb-4 text-red-600'>{error}</div>}
      {!userId ? (
        <div className='text-muted-foreground'>
          Sign in to view your tickets.
        </div>
      ) : loading ? (
        <div>Loading...</div>
      ) : filteredTickets.length === 0 ? (
        <div className='text-muted-foreground'>No tickets found.</div>
      ) : (
        <>
          <div className='grid gap-4'>
            {paginatedTickets.map((t) => (
              <Card
                key={t.id}
                className='flex flex-row items-center justify-between p-4'
              >
                <div>
                  <CardTitle className='text-lg mb-1'>{t.title}</CardTitle>
                  <CardDescription className='text-xs mb-1'>
                    {t.description}
                  </CardDescription>
                  <CardDescription className='text-xs'>
                    Status:{' '}
                    <span className='font-medium'>
                      {t.status.replace('_', ' ')}
                    </span>
                  </CardDescription>
                  <CardDescription className='text-xs mt-1'>
                    Created {new Date(t.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Edit'
                    onClick={() => openEditDialog(t)}
                  >
                    <Pencil className='w-4 h-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Delete'
                    onClick={() => openDeleteDialog(t.id)}
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
            <DialogTitle>Edit Ticket</DialogTitle>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder='Ticket title'
            autoFocus
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder='Description'
            className='mt-2'
          />
          <div className='flex gap-2 items-center mt-2'>
            <label className='text-sm text-muted-foreground'>Status:</label>
            <Select
              value={editStatus}
              onValueChange={(v) => setEditStatus(v as Status)}
            >
              <SelectTrigger className='w-40 h-9'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='open'>Open</SelectItem>
                <SelectItem value='in_progress'>In Progress</SelectItem>
                <SelectItem value='closed'>Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleEdit} disabled={!editTitle.trim()}>
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
            <DialogTitle>Delete Ticket</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this ticket? This action cannot be
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
