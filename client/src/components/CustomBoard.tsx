import React, { useState } from 'react';
import { PIECE_ASSET_MAP } from '../utils/pieces';

interface CustomBoardProps {
  position: Record<string, string>;
  onPieceDrop?: (sourceSquare: string, targetSquare: string, piece: string) => void;
  onSquareClick?: (square: string) => void;
  onSquareRightClick?: (square: string) => void;
  customSquareStyles?: Record<string, React.CSSProperties>;
  orientation?: 'white' | 'black';
  customDarkSquareStyle?: React.CSSProperties;
  customLightSquareStyle?: React.CSSProperties;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const CustomBoard: React.FC<CustomBoardProps> = ({
  position,
  onPieceDrop,
  onSquareClick,
  onSquareRightClick,
  customSquareStyles = {},
  orientation = 'white',
  customDarkSquareStyle = { backgroundColor: '#475569' },
  customLightSquareStyle = { backgroundColor: '#cbd5e1' }
}) => {
  const [draggedPiece, setDraggedPiece] = useState<{ square: string, piece: string } | null>(null);

  const displayRanks = orientation === 'white' ? [...RANKS].reverse() : [...RANKS];
  const displayFiles = orientation === 'white' ? [...FILES] : [...FILES].reverse();

  const handleDragStart = (e: React.DragEvent, square: string, piece: string) => {
    setDraggedPiece({ square, piece });
    e.dataTransfer.setData('text/plain', JSON.stringify({ square, piece }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a ghost image for dragging
    const img = e.target as HTMLImageElement;
    e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    if (!draggedPiece) return;
    
    if (onPieceDrop) {
      onPieceDrop(draggedPiece.square, targetSquare, draggedPiece.piece);
    }
    setDraggedPiece(null);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gridTemplateRows: 'repeat(8, 1fr)',
      width: '100%',
      height: '100%',
      userSelect: 'none'
    }}>
      {displayRanks.map((rank, rankIndex) => (
        displayFiles.map((file, fileIndex) => {
          const square = `${file}${rank}`;
          const isDark = (rankIndex + fileIndex) % 2 !== 0;
          const piece = position[square];
          
          const defaultStyle = isDark ? customDarkSquareStyle : customLightSquareStyle;
          const customStyle = customSquareStyles[square] || {};
          
          return (
            <div
              key={square}
              onClick={() => onSquareClick?.(square)}
              onContextMenu={(e) => {
                e.preventDefault();
                onSquareRightClick?.(square);
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, square)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                ...defaultStyle,
                ...customStyle
              }}
            >
              {/* Optional Coordinates logic could go here */}
              
              {piece && (
                <img
                  src={`/assets/pieces/${PIECE_ASSET_MAP[piece]}`}
                  alt={piece}
                  draggable
                  onDragStart={(e) => handleDragStart(e, square, piece)}
                  className="ae-animated-piece"
                  style={{
                    width: '85%',
                    height: '85%',
                    cursor: 'grab',
                    filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))'
                  }}
                />
              )}
            </div>
          );
        })
      ))}
    </div>
  );
};
