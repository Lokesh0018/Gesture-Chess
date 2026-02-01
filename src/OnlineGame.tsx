import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Link, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { audio } from './audio-manager';
import { vfx } from './vfx-manager';
import { motion, AnimatePresence } from 'framer-motion';
import CheckIndicator from './CheckIndicator';
import GameLayout from './GameLayout';
import type { MoveHistory } from './GameLayout';
import PromotionCinematic from './PromotionCinematic';
import CaptureAnimation from './CaptureAnimation';
import PostGameModal from './PostGameModal';
import GameStartSequence from './GameStartSequence';
import FlyingPiece from './FlyingPiece';

import Piece from './Piece';

const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
const customPieces = pieces.reduce((res: any, p) => {
  const color = p[0] as 'w' | 'b';
  const type = p[1] as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
  res[p] = ({ squareWidth, isDragging, square }: any) => (
    <Piece type={type} color={color} squareWidth={squareWidth} isDragging={isDragging} square={square} />
  );
  return res;
}, {});

const actionBtnStyle = {
  padding: '12px 24px',
  backgroundColor: 'var(--bg-glass)',
  color: 'var(--text-main)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
};

export default function OnlineGame() {
  const [game, setGame] = useState(new Chess());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerRole, setPlayerRole] = useState<'White' | 'Black' | null>(null);
  const playerRoleRef = useRef<'White' | 'Black' | null>(null);
  const [status, setStatus] = useState('Not connected');
  const [boardWidth, setBoardWidth] = useState(window.innerWidth > 850 ? 500 : window.innerWidth - 60);
  const [cinematic, setCinematic] = useState<{ square: string, color: 'w' | 'b', type: 'q' | 'r' | 'b' | 'n' } | null>(null);
  const [captureAnim, setCaptureAnim] = useState<{ square: string, pieceType: 'P' | 'N' | 'B' | 'R' | 'Q' | 'K', pieceColor: 'w' | 'b', capturedBy: 'white' | 'black' } | null>(null);
  const [checkState, setCheckState] = useState<{ king: string, attacker: string | null } | null>(null);
  const [checkmateState, setCheckmateState] = useState<{ color: 'w' | 'b', text: string } | null>(null);
  const [gameOverMsg, setGameOverMsg] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const timingSetting = localStorage.getItem('match_timing') || '10';

  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [promotionSquare, setPromotionSquare] = useState<string | null>(null);
  const moveFromRef = useRef<string | null>(null);
  const promoteToRef = useRef<string | null>(null);
  const [previewFen, setPreviewFen] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<{ sender: string, text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatUnread, setChatUnread] = useState(0);
  const [floatingChats, setFloatingChats] = useState<{ id: string, sender: string, text: string }[]>([]);

  useEffect(() => {
    const handleResize = () => setBoardWidth(window.innerWidth > 850 ? 500 : window.innerWidth - 60);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (checkmateState) {
      document.body.setAttribute('data-def-color', checkmateState.color);
      document.body.setAttribute('data-win-color', checkmateState.color === 'w' ? 'b' : 'w');
    } else {
      document.body.removeAttribute('data-def-color');
      document.body.removeAttribute('data-win-color');
    }
  }, [checkmateState]);

  useEffect(() => {

    // cleanup in-check classes
    document.querySelectorAll('.in-check').forEach(el => el.classList.remove('in-check'));

    if (game.isCheckmate()) {
      audio.playBassDrop();
      setCheckmateState({ color: game.turn(), text: 'CHECKMATE' });
      setCheckState(null);
    } else if ((typeof game.inCheck === 'function' ? game.inCheck() : (game as any).isCheck?.())) {
      let kSq = '';
      const board = game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c]?.type === 'k' && board[r][c]?.color === game.turn()) {
            kSq = String.fromCharCode(97 + c) + (8 - r);
          }
        }
      }
      const history = game.history({ verbose: true }) as any[];
      const lastMove = history[history.length - 1];
      setCheckState({ king: kSq, attacker: lastMove ? lastMove.to : null });
      setCheckmateState(null);
      const sqEl = document.querySelector(`[data-square="${kSq}"]`);
      if (sqEl) sqEl.classList.add('in-check');
      audio.check();
    } else {
      setCheckState(null);
      setCheckmateState(null);
    }
  }, [game.fen()]);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    const savedRoom = sessionStorage.getItem('chess_room');
    const savedRole = sessionStorage.getItem('chess_role');
    if (savedRoom && savedRole) {
      setRoomCode(savedRoom);
      setPlayerRole(savedRole as 'White' | 'Black');
      playerRoleRef.current = savedRole as 'White' | 'Black';
      setStatus('Reconnecting...');
      newSocket.emit('rejoin_room', { roomCode: savedRoom, role: savedRole });
    }

    newSocket.on('game_state', (data) => {
      setGame((g) => {
        const newGame = new Chess();
        newGame.loadPgn(data.pgn);
        return newGame;
      });
      setStatus('Game Started!');
    });

    newSocket.on('room_created', (code) => {
      setRoomCode(code);
      setPlayerRole('White');
      playerRoleRef.current = 'White';
      setStatus('Waiting for opponent...');
      sessionStorage.setItem('chess_room', code);
      sessionStorage.setItem('chess_role', 'White');
    });

    newSocket.on('game_start', () => {
      setStatus('Game Started!');
    });

    newSocket.on('opponent_move', (move) => {
      setGame((g) => {
        const newGame = new Chess();
        newGame.loadPgn(g.pgn());
        try {
          const result = newGame.move(move);
          const boardElement = document.querySelector('.react-board-wrapper') as HTMLElement;

          const movedPiece = result.piece.toLowerCase();
          if (result.captured || ['r', 'q', 'k'].includes(movedPiece)) {
            boardElement.classList.remove('board-ripple');
            boardElement.classList.remove('camera-shake');
            void boardElement.offsetWidth;
            boardElement.classList.add('board-ripple');
            if (result.captured) boardElement.classList.add('camera-shake');
          }

          const orientation = playerRoleRef.current?.toLowerCase() === 'black' ? 'black' : 'white';
          if (result.captured) {
            audio.capture();
            const capturedColor = result.color === 'w' ? 'b' : 'w';
            const capturedType = result.captured.toUpperCase() as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
            vfx.triggerFromSquare('capture', result.to, orientation, boardElement, undefined, capturedType);
            setCaptureAnim({ square: result.to, pieceType: capturedType, pieceColor: capturedColor, capturedBy: result.color === 'w' ? 'white' : 'black' });
          } else if (!result.promotion) {
            audio.playThud();
          }

          if (result.promotion) {
            audio.promote();
            setCinematic({ square: result.to, color: result.color as 'w' | 'b', type: result.promotion as 'q' | 'r' | 'b' | 'n' });
          }
        } catch (e) { }
        return newGame;
      });
    });

    newSocket.on('chat_message', (data) => {
      setChatMessages(prev => [...prev, { sender: data.senderRole, text: data.message }]);
      setChatUnread(prev => prev + 1);

      const id = Math.random().toString(36).substr(2, 9);
      setFloatingChats(prev => [...prev, { id, sender: data.senderRole, text: data.message }]);
      setTimeout(() => {
        setFloatingChats(prev => prev.filter(c => c.id !== id));
      }, 4000);
    });

    newSocket.on('opponent_resigned', (role) => {
      const defeatedColor = role === 'White' ? 'w' : 'b';
      setCheckmateState({ color: defeatedColor, text: `${defeatedColor === 'w' ? 'WHITE' : 'BLACK'} RESIGNED` });
      setGameOverMsg(`${defeatedColor === 'w' ? 'White' : 'Black'} Resigned. ${defeatedColor === 'w' ? 'Black' : 'White'} Wins!`);
    });

    newSocket.on('draw_offered', () => {
      if (confirm('Opponent offered a draw. Accept?')) {
        newSocket.emit('accept_draw', sessionStorage.getItem('chess_room'));
      }
    });

    newSocket.on('draw_agreed', () => {
      setGameOverMsg('Draw agreed.');
    });

    newSocket.on('error', (msg) => {
      alert(msg);
      if (msg === 'Room not found or expired' || msg === 'Room not found') {
        sessionStorage.removeItem('chess_room');
        sessionStorage.removeItem('chess_role');
        setPlayerRole(null);
        setRoomCode('');
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleCreate = () => {
    if (socket) socket.emit('create_room');
  };

  const handleJoin = () => {
    if (socket && joinCode) {
      setRoomCode(joinCode.toUpperCase());
      setPlayerRole('Black');
      playerRoleRef.current = 'Black';
      sessionStorage.setItem('chess_room', joinCode.toUpperCase());
      sessionStorage.setItem('chess_role', 'Black');
      socket.emit('join_room', joinCode.toUpperCase());
    }
  };

  function makeAMove(move: any) {
    if (game.turn() !== playerRole?.[0].toLowerCase()) return null;

    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);

      const boardElement = document.querySelector('.react-board-wrapper') as HTMLElement;

      const movedPiece = result.piece.toLowerCase();
      if (result.captured || ['r', 'q', 'k'].includes(movedPiece)) {
        boardElement.classList.remove('board-ripple');
        boardElement.classList.remove('camera-shake');
        void boardElement.offsetWidth;
        boardElement.classList.add('board-ripple');
        if (result.captured) boardElement.classList.add('camera-shake');
      }

      const orientation = playerRole?.toLowerCase() === 'black' ? 'black' : 'white';
      if (result.captured) {
        audio.capture();
        const capturedColor = result.color === 'w' ? 'b' : 'w';
        const capturedType = result.captured.toUpperCase() as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
        vfx.triggerFromSquare('capture', result.to, orientation, boardElement, undefined, capturedType);
        setCaptureAnim({ square: result.to, pieceType: capturedType, pieceColor: capturedColor, capturedBy: result.color === 'w' ? 'white' : 'black' });
      } else if (!result.promotion) {
        audio.playThud();
      }

      if (result.promotion) {
        audio.promote();
        setCinematic({ square: result.to, color: result.color as 'w' | 'b', type: result.promotion as 'q' | 'r' | 'b' | 'n' });
      }

      if (socket) {
        socket.emit('move', {
          roomCode, move: {
            from: result.from,
            to: result.to,
            promotion: result.promotion
          }
        });
      }

      return result;
    } catch (e) {
      return null;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
    if (!playerRole) return false;
    if (playerRole === 'White' && game.turn() === 'b') return false;
    if (playerRole === 'Black' && game.turn() === 'w') return false;

    const moves = game.moves({ square: sourceSquare as import('chess.js').Square, verbose: true }) as any[];
    const validMove = moves.find((m) => m.to === targetSquare);

    if (!validMove) return false;

    if (validMove.promotion) {
      moveFromRef.current = sourceSquare;
      promoteToRef.current = targetSquare;
      setPromotionSquare(targetSquare);
      return true;
    }

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: validMove.promotion ? 'q' : undefined,
    });
    if (move !== null) {
      setMoveFrom('');
      setOptionSquares({});
    }
    return move !== null;
  }

  function onPromotionPieceSelect(piece: string | undefined) {
    if (piece && moveFromRef.current && promoteToRef.current) {
      const type = piece[1].toLowerCase();
      makeAMove({
        from: moveFromRef.current,
        to: promoteToRef.current,
        promotion: type,
      });
    }
    setPromotionSquare(null);
    moveFromRef.current = null;
    promoteToRef.current = null;
    setMoveFrom('');
    setOptionSquares({});
    return true;
  }

  function getMoveOptions(square: string) {
    const moves = game.moves({
      square: square as import('chess.js').Square,
      verbose: true,
    }) as any[];
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: any = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background: game.get(move.to as any) && game.get(move.to as any)?.color !== game.get(square as any)?.color
          ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square: string) {
    if (!playerRole) return;
    if (playerRole === 'White' && game.turn() === 'b') return;
    if (playerRole === 'Black' && game.turn() === 'w') return;

    function resetFirstMove(sq: string) {
      const hasOptions = getMoveOptions(sq);
      if (hasOptions) setMoveFrom(sq);
    }

    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    const moves = game.moves({ square: moveFrom as import('chess.js').Square, verbose: true }) as any[];
    const validMove = moves.find((m) => m.to === square);

    if (!validMove) {
      resetFirstMove(square);
      return;
    }

    if (validMove.promotion) {
      moveFromRef.current = moveFrom;
      promoteToRef.current = square;
      setPromotionSquare(moveFrom);
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    const move = makeAMove({
      from: moveFrom,
      to: square,
      promotion: validMove.promotion ? 'q' : undefined,
    });

    if (move === null) {
      resetFirstMove(square);
    } else {
      setMoveFrom('');
      setOptionSquares({});
    }
  }

  const isGameOver = !!(gameOverMsg || checkmateState || game.isDraw());
  const isMyTurn = (game.turn() === 'w' && playerRole === 'White') || (game.turn() === 'b' && playerRole === 'Black');
  const activeTurn = isGameOver ? null : (isMyTurn ? 'bottom' : 'top');
  const turnIndicator = gameOverMsg ? gameOverMsg : checkmateState ? `🏆 CHECKMATE • ${checkmateState.color === 'w' ? 'BLACK' : 'WHITE'} WINS` : game.isDraw() ? "🏆 DRAW" : `${game.turn() === 'w' ? 'White' : 'Black'}'s Turn`;

  const h = game.history({ verbose: true }) as any[];
  const lastMove = h[h.length - 1];
  const moveHighlightStyles = lastMove ? {
    [lastMove.from]: { boxShadow: 'inset 0 0 15px rgba(46, 204, 113, 0.5), inset 0 0 2px 2px rgba(46, 204, 113, 0.6)' },
    [lastMove.to]: { boxShadow: 'inset 0 0 15px rgba(46, 204, 113, 0.5), inset 0 0 2px 2px rgba(46, 204, 113, 0.6)' }
  } : {};

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isGameOver) {
      if (checkmateState) {
        const timer = setTimeout(() => setShowModal(true), 2000);
        return () => clearTimeout(timer);
      } else {
        setShowModal(true);
      }
    } else {
      setShowModal(false);
    }
  }, [isGameOver, checkmateState]);

  useEffect(() => {
    if (isGameOver) {
      const timer = setTimeout(() => setShowActions(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowActions(false);
    }
  }, [isGameOver]);

  if (!playerRole || status === 'Waiting for opponent...') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ebecd0', padding: '20px', height: '100vh', justifyContent: 'center' }}>
        <Link to="/lobby" onClick={() => { sessionStorage.removeItem('chess_room'); sessionStorage.removeItem('chess_role'); }} className="back-btn" style={{ position: 'absolute', top: 20, left: 20, color: '#ebecd0', textDecoration: 'none', background: '#403d39', padding: '10px 15px', borderRadius: 8 }}>◀ Quit</Link>
        <div style={{ background: '#302e2b', padding: '40px', borderRadius: '12px', textAlign: 'center', width: '300px' }}>
          <h2>Online Multiplayer</h2>
          <button onClick={handleCreate} className="menu-btn" style={{ width: '100%', marginTop: '15px' }}>Create Game</button>
          <div style={{ margin: '20px 0', color: '#aaa' }}>OR</div>
          <input
            type="text"
            placeholder="Room Code"
            maxLength={4}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            style={{ width: 'calc(100% - 30px)', padding: '15px', fontSize: '1.2rem', borderRadius: '8px', border: '1px solid #5c5852', background: '#262522', color: 'white', textAlign: 'center', textTransform: 'uppercase' }}
          />
          <button onClick={handleJoin} className="menu-btn" style={{ width: '100%', marginTop: '15px', backgroundColor: '#f04e30' }}>Join Game</button>
          {roomCode && <div style={{ marginTop: '20px', fontSize: '2rem', fontWeight: 'bold', color: '#f04e30', letterSpacing: '5px' }}>CODE: {roomCode}</div>}
          <div style={{ marginTop: '15px', color: '#aaa' }}>{status}</div>
        </div>
      </div>
    );
  }

  const history = game.history();
  const moveHistory: MoveHistory[] = [];
  for (let i = 0; i < history.length; i += 2) {
    moveHistory.push({ white: history[i], black: history[i + 1] || '' });
  }

  const whiteC: string[] = [];
  const blackC: string[] = [];

  (game.history({ verbose: true }) as any[]).forEach((m) => {
    if (m.captured) {
      if (m.color === 'w') whiteC.push(`b${m.captured}`);
      else blackC.push(`w${m.captured}`);
    }
  });

  const handleResign = () => {
    if (gameOverMsg || !playerRole) return;
    if (socket) socket.emit('resign', { roomCode, role: playerRole });
    const defeatedColor = playerRole === 'White' ? 'w' : 'b';
    setCheckmateState({ color: defeatedColor, text: `${defeatedColor === 'w' ? 'WHITE' : 'BLACK'} RESIGNED` });
    setGameOverMsg(`${defeatedColor === 'w' ? 'White' : 'Black'} Resigned. ${defeatedColor === 'w' ? 'Black' : 'White'} Wins!`);
  };

  const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let whiteMaterial = 0;
  let blackMaterial = 0;
  const boardData = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = boardData[r][c];
      if (p) {
        if (p.color === 'w') whiteMaterial += pieceValues[p.type] || 0;
        else blackMaterial += pieceValues[p.type] || 0;
      }
    }
  }
  const advantage = playerRole === 'White' ? whiteMaterial - blackMaterial : blackMaterial - whiteMaterial;
  const rawPercentage = 50 + (advantage / 15) * 50;
  const evalPercentage = Math.max(5, Math.min(95, rawPercentage));

  const renderFloatingChats = () => (
    <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1000, pointerEvents: 'none' }}>
      <AnimatePresence>
        {floatingChats.map(chat => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              padding: '10px 14px', borderRadius: '12px', color: 'white',
              fontSize: '14px', maxWidth: '280px', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <span style={{ color: chat.sender === playerRole ? 'var(--accent)' : '#38bdf8', fontWeight: 'bold', marginRight: '6px' }}>{chat.sender}:</span>
            {chat.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <GameLayout
        topPlayerName={playerRole === 'White' ? "Opponent" : "Opponent"}
        bottomPlayerName={playerRole}
        topPlayerClock={`${timingSetting}:00`}
        bottomPlayerClock={`${timingSetting}:00`}
        turnIndicator={turnIndicator}
        evalPercentage={evalPercentage}
        topCaptures={playerRole === 'White' ? blackC : whiteC}
        bottomCaptures={playerRole === 'White' ? whiteC : blackC}
        moveHistory={moveHistory}
        onDraw={() => {
          if (socket) socket.emit('offer_draw', roomCode);
          alert('Draw offered to opponent.');
        }}
        onResign={handleResign}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatUnread={chatUnread}
        setChatUnread={setChatUnread}
        onSendChat={() => {
          if (chatInput.trim() && socket) {
            socket.emit('chat', { roomCode, message: chatInput, senderRole: playerRole });
            setChatInput('');
          }
        }}
        activeTurn={activeTurn}
        isGameOver={!!(gameOverMsg || checkmateState || game.isDraw())}
        onBack={() => {
          if (socket) socket.close();
          sessionStorage.removeItem('chess_room');
          sessionStorage.removeItem('chess_role');
          navigate('/lobby');
        }}
        previewFen={previewFen}
        onMoveHover={(index) => {
          if (index === null) {
            setPreviewFen(null);
          } else {
            const h = game.history({ verbose: true }) as any[];
            if (h[index]) setPreviewFen(h[index].after);
          }
        }}
      >
        {cinematic && (
          <style>{`
            div[data-square="${cinematic.square}"] > div {
              opacity: 0 !important;
            }
            div[data-square="${cinematic.square}"] img {
              opacity: 0 !important;
            }
          `}</style>
        )}
        {cinematic && (
          <PromotionCinematic
            targetSquare={cinematic.square}
            color={cinematic.color}
            promotionType={cinematic.type}
            orientation={playerRole === 'Black' ? 'black' : 'white'}
            boardElement={document.querySelector('.react-board-wrapper') as HTMLElement}
            onComplete={() => setCinematic(null)}
          />
        )}
        {captureAnim && (
          <>
            <CaptureAnimation
              targetSquare={captureAnim.square}
              pieceType={captureAnim.pieceType}
              pieceColor={captureAnim.pieceColor}
              orientation={playerRole === 'Black' ? 'black' : 'white'}
              boardElement={document.querySelector('.react-board-wrapper') as HTMLElement}
              onComplete={() => { }}
            />
            <FlyingPiece
              startSquare={captureAnim.square}
              pieceType={captureAnim.pieceType}
              pieceColor={captureAnim.pieceColor}
              orientation={playerRole === 'Black' ? 'black' : 'white'}
              capturedBy={captureAnim.capturedBy}
              onComplete={() => setCaptureAnim(null)}
            />
          </>
        )}
        {checkState && !checkmateState && (
          <CheckIndicator
            kingSquare={checkState.king}
            attackerSquare={checkState.attacker}
            orientation={playerRole === 'Black' ? 'black' : 'white'}
            boardElement={document.querySelector('.react-board-wrapper') as HTMLElement}
          />
        )}
        {/* @ts-ignore */}
        <Chessboard
          id="OnlineBoard"
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={{ ...moveHighlightStyles, ...optionSquares }}
          customPieces={customPieces}
          promotionToSquare={promotionSquare as import('chess.js').Square | null}
          showPromotionDialog={!!promotionSquare}
          onPromotionPieceSelect={onPromotionPieceSelect}
          boardOrientation={playerRole === 'Black' ? 'black' : 'white'}
          boardWidth={boardWidth}
          customDarkSquareStyle={{ backgroundColor: 'var(--board-dark)' }}
          customLightSquareStyle={{ backgroundColor: 'var(--board-light)' }}
          arePremovesAllowed={true}
          clearPremovesOnRightClick={true}
          areArrowsAllowed={true}
        />
        {renderFloatingChats()}
      </GameLayout>

      <PostGameModal
        isOpen={showModal}
        winnerTitle={checkmateState ? `${checkmateState.color === 'w' ? 'BLACK' : 'WHITE'} WINS` : game.isDraw() ? "DRAW" : "GAME OVER"}
        totalMoves={game.history().length}
        materialAdvantage={advantage}
        onRematch={() => {
          if (socket) socket.emit('create_room'); // simplistic rematch
          window.location.reload();
        }}
      />
      {status === 'Game Started!' && game.history().length === 0 && <GameStartSequence />}
    </div>
  );
}
