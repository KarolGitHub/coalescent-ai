import React, { useRef, useState, useEffect } from 'react';

type Tool = 'pen' | 'eraser' | 'line';

export const WhiteboardCanvas: React.FC<{ boardId: string }> = () => {
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

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='flex items-center gap-2 mb-2'>
        <label className='font-medium'>Tool:</label>
        <button
          className={`px-2 py-1 rounded ${tool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTool('pen')}
        >
          Pen
        </button>
        <button
          className={`px-2 py-1 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTool('eraser')}
        >
          Eraser
        </button>
        <button
          className={`px-2 py-1 rounded ${tool === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTool('line')}
        >
          Line
        </button>
        <label className='ml-4 font-medium'>Color:</label>
        <input
          type='color'
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className='w-8 h-8 p-0 border-none bg-transparent'
          disabled={tool === 'eraser'}
        />
        <label className='ml-4 font-medium'>Size:</label>
        <input
          type='range'
          min={1}
          max={20}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className='w-24'
        />
        <span className='ml-2 w-8 text-center'>{brushSize}</span>
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
