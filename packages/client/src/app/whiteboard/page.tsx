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
import { Plus, LayoutPanelLeft } from 'lucide-react';

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
              <Button asChild variant='outline' size='sm'>
                <Link href={`/whiteboard/${wb.id}`}>Open</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
