'use client';

import { useParams } from 'next/navigation';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';

export default function WhiteboardPage() {
  const params = useParams();
  const boardId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
      <h1 className='text-2xl font-bold mb-4'>Whiteboard: {boardId}</h1>
      <WhiteboardCanvas boardId={boardId} />
    </div>
  );
}
