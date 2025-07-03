import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
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
import { getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { Save } from 'lucide-react';

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

type ButtonVariants = VariantProps<typeof buttonVariants>;

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
  const [strokePoints, setStrokePoints] = useState<{ x: number; y: number }[]>(
    []
  );

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
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;
    socket.emit('join', { boardId });

    socket.on('draw-event', (event: DrawEvent) => {
      // Ignore own events
      if (event.userId === userIdRef.current) return;
      handleRemoteDrawEvent(event);
    });
    // Listen for initial load of all events
    socket.on('load-events', (events: DrawEvent[]) => {
      events.forEach(handleRemoteDrawEvent);
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
      const start = getPos(e);
      setLastPoint(start);
      setStrokePoints([start]);
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
      setStrokePoints((pts) => [...pts, { x, y }]);
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
    if (drawing && strokePoints.length > 1) {
      emitDrawEvent({
        type: tool === 'eraser' ? 'erase' : 'draw',
        tool,
        color,
        brushSize,
        points: strokePoints,
        boardId,
      });
    }
    setDrawing(false);
    setLastPoint(null);
    setStrokePoints([]);
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

  // Save canvas as PNG
  const saveAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `whiteboard-${boardId}-${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save canvas as SVG
  const saveAsSVG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', canvas.width.toString());
    svg.setAttribute('height', canvas.height.toString());
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Add white background
    const background = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', 'white');
    svg.appendChild(background);

    // Convert canvas to image and embed in SVG
    const image = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'image'
    );
    image.setAttribute('width', '100%');
    image.setAttribute('height', '100%');
    image.setAttribute('href', canvas.toDataURL('image/png'));
    svg.appendChild(image);

    // Convert SVG to string and create download link
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `whiteboard-${boardId}-${new Date().toISOString()}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    <Card className='relative h-full w-full overflow-hidden'>
      <CardContent className='h-full p-0'>
        <div className='absolute left-4 top-4 z-10 flex gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon'>
                <Save className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={saveAsPNG}>
                Save as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={saveAsSVG}>
                Save as SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'pen' ? 'default' : 'outline'}
                  size='icon'
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
                <Button variant='outline' className='ml-2'>
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
                  onClick={clearCanvas}
                  aria-label='Clear'
                >
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear the board</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <canvas
          ref={canvasRef}
          className='h-full w-full touch-none bg-white'
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {previewLine && (
          <svg
            className='pointer-events-none absolute left-0 top-0 h-full w-full'
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <line
              x1={previewLine.x1}
              y1={previewLine.y1}
              x2={previewLine.x2}
              y2={previewLine.y2}
              stroke={color}
              strokeWidth={brushSize}
              strokeLinecap='round'
            />
          </svg>
        )}
      </CardContent>
    </Card>
  );
};
