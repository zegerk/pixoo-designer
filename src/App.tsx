import React, { useState, useRef, useEffect } from 'react';
import { Download, Eraser, Square, Save, Trash2, X } from 'lucide-react';

interface SavedImage {
  id: string;
  grid: string[][];
  timestamp: number;
  thumbnail: string;
}

function App() {
  const [grid, setGrid] = useState<string[][]>(Array(64).fill(null).map(() => Array(64).fill('#000000')));
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);

  const colors = [
    // Primary colors
    '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#ff00ff', '#00ffff', '#ffffff', '#000000',
    // Pastels
    '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA',
    // Dark shades
    '#800000', '#008000', '#000080', '#808000',
    // Vibrant colors
    '#FF4500', '#32CD32', '#4169E1', '#FFD700',
    // Soft colors
    '#FFA07A', '#98FB98', '#87CEEB', '#DDA0DD'
  ];

  useEffect(() => {
    // Load saved images from localStorage
    const saved = localStorage.getItem('pixoo-saved-images');
    if (saved) {
      setSavedImages(JSON.parse(saved));
    }
  }, []);

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    const newGrid = [...grid];
    newGrid[row][col] = isEraser ? '#000000' : currentColor;
    setGrid(newGrid);
  };

  const handleMouseMove = (row: number, col: number) => {
    if (!isDrawing) return;
    const newGrid = [...grid];
    newGrid[row][col] = isEraser ? '#000000' : currentColor;
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const generateThumbnail = () => {
    const canvas = thumbnailCanvasRef.current;
    if (!canvas) return '';

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 128, 128);

    grid.forEach((row, i) => {
      row.forEach((color, j) => {
        ctx.fillStyle = color;
        ctx.fillRect(j * 2, i * 2, 2, 2);
      });
    });

    return canvas.toDataURL();
  };

  const saveCurrentImage = () => {
    const thumbnail = generateThumbnail();
    const newSavedImage: SavedImage = {
      id: Date.now().toString(),
      grid: [...grid],
      timestamp: Date.now(),
      thumbnail
    };

    const updatedSavedImages = [newSavedImage, ...savedImages];
    setSavedImages(updatedSavedImages);
    localStorage.setItem('pixoo-saved-images', JSON.stringify(updatedSavedImages));
  };

  const loadSavedImage = (savedImage: SavedImage) => {
    setGrid(savedImage.grid);
  };

  const deleteSavedImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the load image action
    const updatedSavedImages = savedImages.filter(img => img.id !== id);
    setSavedImages(updatedSavedImages);
    localStorage.setItem('pixoo-saved-images', JSON.stringify(updatedSavedImages));
  };

  const cleanAll = () => {
    setGrid(Array(64).fill(null).map(() => Array(64).fill('#000000')));
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 640, 640);

    grid.forEach((row, i) => {
      row.forEach((color, j) => {
        ctx.fillStyle = color;
        ctx.fillRect(j * 10, i * 10, 10, 10);
      });
    });

    const link = document.createElement('a');
    link.download = 'pixoo-art.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Pixoo 64 Simulator</h1>
        
        <div className="mb-6 flex flex-wrap gap-4 justify-center max-w-[640px]">
          <div className="flex flex-wrap gap-2 justify-center">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-lg border-2 ${currentColor === color ? 'border-white' : 'border-transparent'} hover:scale-110 transition-transform`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setCurrentColor(color);
                  setIsEraser(false);
                }}
                title={color}
              />
            ))}
          </div>
          <button
            className={`p-2 rounded-lg ${isEraser ? 'bg-blue-500' : 'bg-gray-700'} text-white hover:scale-110 transition-transform`}
            onClick={() => setIsEraser(!isEraser)}
            title="Eraser"
          >
            <Eraser size={20} />
          </button>
          <button
            className="p-2 rounded-lg bg-gray-700 text-white hover:bg-red-600 transition-colors hover:scale-110 transition-transform"
            onClick={cleanAll}
            title="Clean All"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex gap-8">
          <div>
            <div 
              className="grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(64, 10px)',
                gap: '0px',
                border: '2px solid #333',
                backgroundColor: '#000',
                cursor: isEraser ? 'crosshair' : 'pointer'
              }}
              onMouseLeave={handleMouseUp}
            >
              {grid.map((row, i) =>
                row.map((color, j) => (
                  <div
                    key={`${i}-${j}`}
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: color,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseDown={() => handleMouseDown(i, j)}
                    onMouseMove={() => handleMouseMove(i, j)}
                    onMouseUp={handleMouseUp}
                  />
                ))
              )}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={downloadImage}
              >
                <Download size={20} />
                Download PNG
              </button>
              <button
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                onClick={saveCurrentImage}
              >
                <Save size={20} />
                Save
              </button>
            </div>
          </div>

          <div className="w-48">
            <h2 className="text-white text-lg font-semibold mb-4">Saved Images</h2>
            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2">
              {savedImages.map((saved) => (
                <div
                  key={saved.id}
                  className="relative group"
                >
                  <button
                    className="w-full bg-gray-700 rounded-lg p-2 hover:bg-gray-600 transition-colors"
                    onClick={() => loadSavedImage(saved)}
                  >
                    <img
                      src={saved.thumbnail}
                      alt="Saved pixel art"
                      className="w-full aspect-square object-contain mb-2"
                    />
                    <div className="text-gray-300 text-sm">
                      {new Date(saved.timestamp).toLocaleString()}
                    </div>
                  </button>
                  <button
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    onClick={(e) => deleteSavedImage(saved.id, e)}
                    title="Delete saved image"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvases for image export and thumbnails */}
      <canvas
        ref={canvasRef}
        width="640"
        height="640"
        style={{ display: 'none' }}
      />
      <canvas
        ref={thumbnailCanvasRef}
        width="128"
        height="128"
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default App;