export const getCustomPieces = (theme: string = 'classic') => {
  const piecesList = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
  const custom: Record<string, any> = {};
  piecesList.forEach(p => {
    custom[p] = ({ squareWidth }: { squareWidth: number }) => (
      <div style={{ width: squareWidth, height: squareWidth, backgroundImage: `url(/assets/pieces/${theme}/${p}.svg)`, backgroundSize: '100%', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} />
    );
  });
  return custom;
};
