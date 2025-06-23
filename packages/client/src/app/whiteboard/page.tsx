'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Plus, LayoutPanelLeft, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface Whiteboard {
  id: string;
  name: string;
  created_at: string;
}

export default function WhiteboardListPage() {
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchWhiteboards = async () => {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('whiteboards')
        .select('id, name, created_at')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setWhiteboards(data || []);
      setLoading(false);
    };
    fetchWhiteboards();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('whiteboards')
      .insert([{ name }])
      .select('id, name, created_at')
      .single();
    if (error) setError(error.message);
    else if (data) setWhiteboards((prev) => [data, ...prev]);
    setName('');
    setCreating(false);
  };

  const openEditDialog = (wb: Whiteboard) => {
    setEditId(wb.id);
    setEditName(wb.name);
    setDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editId || !editName.trim()) return;
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('whiteboards')
      .update({ name: editName })
      .eq('id', editId)
      .select('id, name, created_at')
      .single();
    if (error) setError(error.message);
    else if (data)
      setWhiteboards((prev) =>
        prev.map((wb) => (wb.id === editId ? { ...wb, name: data.name } : wb))
      );
    setDialogOpen(false);
    setEditId(null);
    setEditName('');
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('whiteboards')
      .delete()
      .eq('id', deletingId);
    if (error) setError(error.message);
    else setWhiteboards((prev) => prev.filter((wb) => wb.id !== deletingId));
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <div className='max-w-2xl mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6 flex items-center gap-2'>
        <LayoutPanelLeft className='w-7 h-7 text-primary' /> Whiteboards
      </h1>
      <form onSubmit={handleCreate} className='flex gap-2 mb-8'>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='New whiteboard name'
          className='flex-1'
          disabled={creating}
        />
        <Button type='submit' disabled={creating || !name.trim()}>
          <Plus className='w-4 h-4 mr-1' /> Create
        </Button>
      </form>
      {error && <div className='mb-4 text-red-600'>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : whiteboards.length === 0 ? (
        <div className='text-muted-foreground'>
          No whiteboards yet. Create one above!
        </div>
      ) : (
        <div className='grid gap-4'>
          {whiteboards.map((wb) => (
            <Card
              key={wb.id}
              className='flex flex-row items-center justify-between p-4'
            >
              <div>
                <CardTitle className='text-lg mb-1'>
                  <Link
                    href={`/whiteboard/${wb.id}`}
                    className='hover:underline'
                  >
                    {wb.name}
                  </Link>
                </CardTitle>
                <CardDescription className='text-xs'>
                  Created {new Date(wb.created_at).toLocaleString()}
                </CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' size='sm' asChild>
                  <Link href={`/whiteboard/${wb.id}`}>Open</Link>
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Rename'
                  onClick={() => openEditDialog(wb)}
                >
                  <Pencil className='w-4 h-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Delete'
                  onClick={() => openDeleteDialog(wb.id)}
                >
                  <Trash2 className='w-4 h-4 text-red-500' />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Whiteboard</DialogTitle>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder='Whiteboard name'
            autoFocus
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
            <DialogTitle>Delete Whiteboard</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this whiteboard? This action cannot
            be undone.
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
