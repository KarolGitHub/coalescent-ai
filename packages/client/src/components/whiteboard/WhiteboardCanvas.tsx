import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { io, Socket } from 'socket.io-client';

type Tool = 'pen' | 'eraser' | 'line';

type DrawEvent = {
  type: 'draw' | 'erase' | 'line' | 'clear';
  tool: Tool;
  color: string;
  brushSize: number;
  points: { x: number; y: number }[];
  boardId: string;
  userId: string;
};

export const WhiteboardCanvas: React.FC<{ boardId: string }> = ({
  boardId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#222');
  const [brushSize, setBrushSize] = useState(3);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [previewLine, setPreviewLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string>('');

  // Get user ID from Supabase
  useEffect(() => {
    const getUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      userIdRef.current = data.user?.id || '';
    };
    getUser();
  }, []);

  // Socket.IO connection
  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] }); // Change URL if needed
    socketRef.current = socket;
    socket.emit('join', { boardId });

    socket.on('draw-event', (event: DrawEvent) => {
      // Ignore own events
      if (event.userId === userIdRef.current) return;
      handleRemoteDrawEvent(event);
    });

    return () => {
      socket.emit('leave', { boardId });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  // Resize canvas to fit parent
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'line') {
      const { x, y } = getPos(e);
      setLineStart({ x, y });
      setPreviewLine(null);
    } else {
      setDrawing(true);
      setLastPoint(getPos(e));
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    if (tool === 'line') {
      if (lineStart) {
        setPreviewLine({ x1: lineStart.x, y1: lineStart.y, x2: x, y2: y });
      }
      return;
    }
    if (!drawing) return;
    if (lastPoint) {
      ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      emitDrawEvent({
        type: tool === 'eraser' ? 'erase' : 'draw',
        tool,
        color,
        brushSize,
        points: [lastPoint, { x, y }],
        boardId,
      });
    }
    setLastPoint({ x, y });
  };

  const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'line' && lineStart && e) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      const { x, y } = getPos(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lineStart.x, lineStart.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      emitDrawEvent({
        type: 'line',
        tool,
        color,
        brushSize,
        points: [lineStart, { x, y }],
        boardId,
      });
      setLineStart(null);
      setPreviewLine(null);
      return;
    }
    setDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      emitDrawEvent({
        type: 'clear',
        tool,
        color,
        brushSize,
        points: [],
        boardId,
      });
    }
  };

  // Draw preview line
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (previewLine) {
      // Save current canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
      // Draw preview line
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(previewLine.x1, previewLine.y1);
      ctx.lineTo(previewLine.x2, previewLine.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }, [previewLine, color, brushSize]);

  // Emit draw events
  const emitDrawEvent = (event: Omit<DrawEvent, 'userId'>) => {
    if (!socketRef.current || !userIdRef.current) return;
    socketRef.current.emit('draw-event', {
      ...event,
      userId: userIdRef.current,
    });
  };

  // Handle remote draw events
  const handleRemoteDrawEvent = (event: DrawEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (event.type === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (event.type === 'draw' || event.type === 'erase') {
      ctx.strokeStyle = event.type === 'erase' ? '#fff' : event.color;
      ctx.lineWidth = event.brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const [start, ...rest] = event.points;
      ctx.moveTo(start.x, start.y);
      rest.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
      return;
    }
    if (event.type === 'line') {
      ctx.strokeStyle = event.color;
      ctx.lineWidth = event.brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(event.points[0].x, event.points[0].y);
      ctx.lineTo(event.points[1].x, event.points[1].y);
      ctx.stroke();
      return;
    }
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      <TooltipProvider>
        <Card className='mb-2 w-fit p-2 shadow-md'>
          <CardContent className='flex items-center gap-2 p-0'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'pen' ? 'default' : 'outline'}
                  size='icon'
                  type='button'
                  onClick={() => setTool('pen')}
                  aria-label='Pen'
                >
                  ✏️
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pen</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'eraser' ? 'default' : 'outline'}
                  size='icon'
                  type='button'
                  onClick={() => setTool('eraser')}
                  aria-label='Eraser'
                >
                  🧽
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eraser</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'line' ? 'default' : 'outline'}
                  size='icon'
                  type='button'
                  onClick={() => setTool('line')}
                  aria-label='Line'
                >
                  📏
                </Button>
              </TooltipTrigger>
              <TooltipContent>Line</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='ml-2'
                  type='button'
                  disabled={tool === 'eraser'}
                >
                  <span
                    className='w-4 h-4 inline-block rounded-full border'
                    style={{ background: color, borderColor: color }}
                  />
                  <span className='ml-2'>Color</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <input
                    type='color'
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className='w-8 h-8 p-0 border-none bg-transparent cursor-pointer'
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='ml-2' type='button'>
                  <span className='w-4 h-4 inline-block rounded-full bg-gray-300 mr-2' />
                  Size: {brushSize}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='p-4 w-48'>
                <Slider
                  min={1}
                  max={20}
                  value={[brushSize]}
                  onValueChange={(v: number[]) => setBrushSize(v[0])}
                />
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='destructive'
                  className='ml-4'
                  type='button'
                  onClick={clearCanvas}
                  aria-label='Clear'
                >
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear the board</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </TooltipProvider>
      <div
        style={{
          width: 800,
          height: 500,
          border: '2px solid #ddd',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
};
