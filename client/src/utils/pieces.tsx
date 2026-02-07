const PIECE_ASSET_MAP: Record<string, string> = {
  wK: 'whiteKing.svg',
  wQ: 'whiteQueen.svg',
  wR: 'whiteRook.svg',
  wB: 'whiteBishop.svg',
  wN: 'whiteHorse.svg',
  wP: 'whitePawn.svg',
  bK: 'blackKing.svg',
  bQ: 'blackQueen.svg',
  bR: 'bllackRook.svg',
  bB: 'blackBishop.svg',
  bN: 'blackHorse.svg',
  bP: 'blackPawn.svg'
};

export const getCustomPieces = (theme: string = 'custom') => {
  const piecesList = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
  const custom: Record<string, any> = {};
  piecesList.forEach(p => {
    custom[p] = ({ squareWidth }: { squareWidth: number }) => {
      // If it's the custom theme, use the new specific mapped file names. 
      // Otherwise fallback to classic standard names.
      const fileName = theme === 'custom' ? PIECE_ASSET_MAP[p] : `${theme}/${p}.svg`;
      return (
        <div style={{ width: squareWidth, height: squareWidth, backgroundImage: `url(/assets/pieces/${fileName})`, backgroundSize: '100%', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} />
      );
    }
  });
  return custom;
};
