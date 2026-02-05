import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pen,
  Circle,
  Square,
  ArrowRight,
  Type,
  Undo2,
  Download,
  X,
  Copy,
  Palette,
} from 'lucide-react';

interface Annotation {
  id: string;
  type: 'pen' | 'circle' | 'rectangle' | 'arrow' | 'text';
  points?: Array<{ x: number; y: number }>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  lineWidth: number;
}

interface PhotoAnnotationToolsProps {
  imageUrl: string;
  onSave?: (annotatedImageUrl: string) => Promise<void>;
  onClose?: () => void;
}

export function PhotoAnnotationTools({
  imageUrl,
  onSave,
  onClose,
}: PhotoAnnotationToolsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [tool, setTool] = useState<'pen' | 'circle' | 'rectangle' | 'arrow' | 'text'>('pen');
  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(2);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load image and setup canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        redrawCanvas();
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const redrawCanvas = () => {
    const ctx = getCanvasContext();
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!ctx || !canvas || !img) return;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Draw annotations
    annotations.forEach((annotation) => {
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.lineWidth = annotation.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (annotation.type) {
        case 'pen':
          if (annotation.points && annotation.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            annotation.points.forEach((point) => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;

        case 'circle':
          if (annotation.x !== undefined && annotation.y !== undefined && annotation.width !== undefined) {
            const radius = annotation.width / 2;
            ctx.beginPath();
            ctx.arc(annotation.x, annotation.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;

        case 'rectangle':
          if (
            annotation.x !== undefined &&
            annotation.y !== undefined &&
            annotation.width !== undefined &&
            annotation.height !== undefined
          ) {
            ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
          }
          break;

        case 'arrow':
          if (annotation.points && annotation.points.length >= 2) {
            const start = annotation.points[0];
            const end = annotation.points[annotation.points.length - 1];
            drawArrow(ctx, start.x, start.y, end.x, end.y, annotation.lineWidth);
          }
          break;

        case 'text':
          if (annotation.text && annotation.x !== undefined && annotation.y !== undefined) {
            ctx.fillStyle = annotation.color;
            ctx.font = `${annotation.lineWidth * 8}px Arial`;
            ctx.fillText(annotation.text, annotation.x, annotation.y);
          }
          break;
      }
    });
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    headlen: number
  ) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'text') {
      const { x, y } = getCanvasCoordinates(e);
      setTextPosition({ x, y });
      return;
    }

    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    setCurrentPoints([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const { x, y } = getCanvasCoordinates(e);

    if (tool === 'pen') {
      setCurrentPoints((prev) => [...prev, { x, y }]);
    } else if (tool === 'circle' || tool === 'rectangle' || tool === 'arrow') {
      setCurrentPoints([currentPoints[0], { x, y }]);
    }

    // Preview drawing
    const ctx = getCanvasContext();
    if (ctx) {
      redrawCanvas();

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'pen' && currentPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'circle' && currentPoints.length > 0) {
        const radius = Math.hypot(x - currentPoints[0].x, y - currentPoints[0].y);
        ctx.beginPath();
        ctx.arc(currentPoints[0].x, currentPoints[0].y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'rectangle' && currentPoints.length > 0) {
        const width = x - currentPoints[0].x;
        const height = y - currentPoints[0].y;
        ctx.strokeRect(currentPoints[0].x, currentPoints[0].y, width, height);
      } else if (tool === 'arrow' && currentPoints.length > 0) {
        drawArrow(ctx, currentPoints[0].x, currentPoints[0].y, x, y, lineWidth);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    setIsDrawing(false);

    const { x, y } = getCanvasCoordinates(e);
    let newAnnotation: Annotation | null = null;

    switch (tool) {
      case 'pen':
        if (currentPoints.length > 1) {
          newAnnotation = {
            id: Date.now().toString(),
            type: 'pen',
            points: [...currentPoints, { x, y }],
            color,
            lineWidth,
          };
        }
        break;

      case 'circle':
        if (currentPoints.length > 0) {
          const radius = Math.hypot(x - currentPoints[0].x, y - currentPoints[0].y);
          newAnnotation = {
            id: Date.now().toString(),
            type: 'circle',
            x: currentPoints[0].x,
            y: currentPoints[0].y,
            width: radius * 2,
            color,
            lineWidth,
          };
        }
        break;

      case 'rectangle':
        if (currentPoints.length > 0) {
          newAnnotation = {
            id: Date.now().toString(),
            type: 'rectangle',
            x: currentPoints[0].x,
            y: currentPoints[0].y,
            width: x - currentPoints[0].x,
            height: y - currentPoints[0].y,
            color,
            lineWidth,
          };
        }
        break;

      case 'arrow':
        if (currentPoints.length > 0) {
          newAnnotation = {
            id: Date.now().toString(),
            type: 'arrow',
            points: [currentPoints[0], { x, y }],
            color,
            lineWidth,
          };
        }
        break;
    }

    if (newAnnotation) {
      setAnnotations((prev) => [...prev, newAnnotation!]);
      redrawCanvas();
    }

    setCurrentPoints([]);
  };

  const handleAddText = () => {
    if (textInput && textPosition) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'text',
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        color,
        lineWidth: 1,
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setTextInput('');
      setTextPosition(null);
      redrawCanvas();
    }
  };

  const handleUndo = () => {
    if (annotations.length > 0) {
      setAnnotations((prev) => prev.slice(0, -1));
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `annotated-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Failed to save annotated photo:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-background p-4 rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center border-b pb-4">
        {/* Drawing Tools */}
        <div className="flex gap-2 border-r pr-2">
          <Button
            size="sm"
            variant={tool === 'pen' ? 'default' : 'outline'}
            onClick={() => setTool('pen')}
            title="Pen"
            className="gap-2"
          >
            <Pen className="h-4 w-4" />
            Pen
          </Button>
          <Button
            size="sm"
            variant={tool === 'circle' ? 'default' : 'outline'}
            onClick={() => setTool('circle')}
            title="Circle"
            className="gap-2"
          >
            <Circle className="h-4 w-4" />
            Circle
          </Button>
          <Button
            size="sm"
            variant={tool === 'rectangle' ? 'default' : 'outline'}
            onClick={() => setTool('rectangle')}
            title="Rectangle"
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Rectangle
          </Button>
          <Button
            size="sm"
            variant={tool === 'arrow' ? 'default' : 'outline'}
            onClick={() => setTool('arrow')}
            title="Arrow"
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Arrow
          </Button>
          <Button
            size="sm"
            variant={tool === 'text' ? 'default' : 'outline'}
            onClick={() => setTool('text')}
            title="Text"
            className="gap-2"
          >
            <Type className="h-4 w-4" />
            Text
          </Button>
        </div>

        {/* Color and Line Width */}
        <div className="flex gap-2 items-center border-r pr-2">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-12 cursor-pointer"
              title="Color"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium">Width:</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-12 h-8"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleUndo}
            disabled={annotations.length === 0}
            className="gap-2"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          {onSave && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || annotations.length === 0}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
          {onClose && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex justify-center bg-gray-50 rounded-lg p-2 overflow-auto max-h-96">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="max-w-full max-h-full cursor-crosshair border border-gray-300 rounded"
        />
      </div>

      {/* Text Input */}
      {tool === 'text' && textPosition && (
        <div className="flex gap-2 items-center bg-blue-50 p-3 rounded">
          <Input
            placeholder="Enter text..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddText();
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleAddText}>
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setTextPosition(null);
              setTextInput('');
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Annotation Count */}
      <div className="text-xs text-muted-foreground">
        {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} added
      </div>
    </div>
  );
}
