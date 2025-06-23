import React, { useRef, useState, useEffect } from 'react';

interface WhiteboardCanvasProps {
  boardId: string;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  boardId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#222');
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );

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
    setDrawing(true);
    setLastPoint(getPos(e));
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    if (lastPoint) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='flex items-center gap-2 mb-2'>
        <label className='font-medium'>Pen Color:</label>
        <input
          type='color'
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className='w-8 h-8 p-0 border-none bg-transparent'
        />
        <button
          onClick={clearCanvas}
          className='ml-4 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600'
        >
          Clear
        </button>
      </div>
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
            cursor: 'crosshair',
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
