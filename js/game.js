import { state, COLORS, PIECES, recordPosition } from './state.js';
import { clearDots, renderBoard, getSquare } from './dom.js';
import { isUnderAttack, hasAnyValidMoves, checkDrawConditions } from './logic.js';
import { showPromotionModal, showCheckMessage, showGameOver, showNotification } from './ui.js';

const moveSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');
const captureSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3');

export const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const startTimer = () => {
    if (state.timerInterval) return;
    state.timerInterval = setInterval(() => {
        if (state.currentTurn === COLORS.WHITE) {
            state.whiteTime--;
            if (state.clockWhiteDOM) state.clockWhiteDOM.innerText = formatTime(state.whiteTime);
            if (state.whiteTime <= 0) {
                stopTimer();
                showGameOver("Black Wins on Time");
            }
        } else {
            state.blackTime--;
            if (state.clockBlackDOM) state.clockBlackDOM.innerText = formatTime(state.blackTime);
            if (state.blackTime <= 0) {
                stopTimer();
                showGameOver("White Wins on Time");
            }
        }
    }, 1000);
};

export const stopTimer = () => {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
};
const checkSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3');

export const postMoveChecks = () => {
    let kingSq = null;
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            const p = state.board[i][j];
            if(p && p.color === state.currentTurn && p.type === PIECES.KING) {
                kingSq = {i, j};
                break;
            }
        }
    }
    
    let inCheck = false;
    if (kingSq) {
        inCheck = isUnderAttack(kingSq.i, kingSq.j, state.currentTurn);
    }
    
    document.querySelectorAll('.in-check').forEach(el => el.classList.remove('in-check'));
    if (inCheck && kingSq) {
        const sq = getSquare(kingSq.i, kingSq.j);
        if(sq) sq.classList.add('in-check');
    }

    if (!hasAnyValidMoves()) {
        if (inCheck) showGameOver(`Checkmate! ${state.currentTurn === COLORS.WHITE ? 'Black' : 'White'} Wins!`);
        else showGameOver("Stalemate! It's a draw!");
        return;
    }
    
    const drawMsg = checkDrawConditions();
    if (drawMsg) {
        showGameOver(drawMsg);
        return;
    }

    if (inCheck) {
        showCheckMessage();
        checkSound.play().catch(e => console.warn("Audio play prevented", e));
    }
};

const getAlgebraic = (piece, startI, startJ, targetI, targetJ, captured) => {
    const files = "abcdefgh";
    const ranks = "87654321";
    let notation = "";
    
    if (piece.type === PIECES.KING && Math.abs(startJ - targetJ) === 2) {
        return targetJ === 6 ? "O-O" : "O-O-O";
    }
    
    if (piece.type !== PIECES.PAWN) {
        const pChar = piece.type === PIECES.HORSE ? 'N' : piece.type[0];
        notation += pChar;
    } else if (captured) {
        notation += files[startJ];
    }
    
    if (captured) notation += "x";
    notation += files[targetJ] + ranks[targetI];
    
    return notation;
}

const playShootingAnimation = (startI, startJ, targetI, targetJ) => {
    return new Promise(resolve => {
        const attackerSq = getSquare(startI, startJ);
        const targetSq = getSquare(targetI, targetJ);
        if (!attackerSq || !targetSq) {
            resolve();
            return;
        }

        const color = state.currentTurn;
        const weapons = [`${color}Gun.png`, 'gun.png', 'knife.png', 'missile.png', 'hand-grenade.png', 'bomb.png', 'star.png', 'sight.png'];
        const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
        const isGun = randomWeapon.toLowerCase().includes('gun');
        
        const weaponNode = document.createElement('img');
        weaponNode.src = `./pngs/${randomWeapon}`;
        weaponNode.style.position = 'absolute';
        weaponNode.style.width = '30px'; 
        weaponNode.style.height = 'auto'; // Prevent stretching from global img { height: 85% }
        weaponNode.style.zIndex = '100';
        weaponNode.style.left = '50%';
        weaponNode.style.top = '50%';
        
        const attRect = attackerSq.getBoundingClientRect();
        const tgtRect = targetSq.getBoundingClientRect();
        
        const dx = tgtRect.left - attRect.left;
        const dy = tgtRect.top - attRect.top;
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = angleRad * 180 / Math.PI;

        const offsetX = Math.cos(angleRad) * 25;
        const offsetY = Math.sin(angleRad) * 25;
        const flipY = (Math.abs(angleDeg) > 90) ? -1 : 1;

        if (isGun) {
            weaponNode.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg) scaleX(0) scaleY(0)`;
            weaponNode.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            attackerSq.appendChild(weaponNode);

            requestAnimationFrame(() => {
                weaponNode.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg) scaleX(1) scaleY(${flipY})`;
            });

            setTimeout(() => {
                const bullet = document.createElement('div');
                bullet.style.position = 'absolute';
                bullet.style.width = '12px';
                bullet.style.height = '4px';
                bullet.style.backgroundColor = '#ffcc00';
                bullet.style.borderRadius = '2px';
                bullet.style.boxShadow = '0 0 5px #ff6600';
                bullet.style.zIndex = '99';
                bullet.style.left = '50%';
                bullet.style.top = '50%';
                bullet.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg)`;
                bullet.style.transition = 'transform 0.15s linear';
                
                attackerSq.appendChild(bullet);

                requestAnimationFrame(() => {
                    bullet.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${angleDeg}deg)`;
                });

                setTimeout(() => {
                    if (bullet.parentNode) bullet.parentNode.removeChild(bullet);
                    showExplosion(targetSq, resolve, weaponNode);
                }, 150);

            }, 200);
        } else {
            weaponNode.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg) scaleX(0) scaleY(0)`;
            weaponNode.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            attackerSq.appendChild(weaponNode);

            requestAnimationFrame(() => {
                weaponNode.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg) scaleX(1) scaleY(${flipY})`;
                
                setTimeout(() => {
                    weaponNode.style.transition = 'transform 0.25s ease-in';
                    weaponNode.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${angleDeg}deg) scaleX(1) scaleY(${flipY})`;
                    
                    setTimeout(() => {
                        showExplosion(targetSq, resolve, weaponNode);
                    }, 250);
                }, 150);
            });
        }

        function showExplosion(tSq, res, wNode) {
            const explosions = ['blasting.png', 'explosion.png', 'nuclear-explosion.png'];
            const randomExplosion = explosions[Math.floor(Math.random() * explosions.length)];
            
            const bang = document.createElement('img');
            bang.src = `./pngs/${randomExplosion}`;
            bang.style.position = 'absolute';
            bang.style.width = '60px';
            bang.style.height = 'auto'; // Prevent stretching
            bang.style.zIndex = '100';
            bang.style.left = '50%';
            bang.style.top = '50%';
            bang.style.transform = 'translate(-50%, -50%) scale(0)';
            bang.style.transition = 'transform 0.1s';
            tSq.appendChild(bang);
            
            requestAnimationFrame(() => {
                bang.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });

            const tgtImgReal = Array.from(tSq.querySelectorAll('img')).find(img => img.dataset && img.dataset.value);
            if (tgtImgReal) {
                tgtImgReal.style.transition = 'opacity 0.2s, transform 0.2s';
                tgtImgReal.style.opacity = '0';
                tgtImgReal.style.transform = 'scale(0.5)';
            }

            setTimeout(() => {
                if(wNode.parentNode) wNode.parentNode.removeChild(wNode);
                if(bang.parentNode) bang.parentNode.removeChild(bang);
                res();
            }, 300);
        }
    });
};

export const movePiece = async (targetI, targetJ) => {
    if (window.isAnimating) return;
    const {i: startI, j: startJ} = state.selectedSquare;
    const piece = state.board[startI][startJ];
    const targetPiece = state.board[targetI][targetJ];

    let captured = false;

    if (piece.type === PIECES.PAWN || targetPiece) {
        state.halfMoveClock = 0;
    } else {
        state.halfMoveClock++;
    }

    document.querySelectorAll('.last-move').forEach(el => el.classList.remove('last-move'));
    const sSq = getSquare(startI, startJ);
    const tSq = getSquare(targetI, targetJ);
    if(sSq) sSq.classList.add('last-move');
    if(tSq) tSq.classList.add('last-move');

    if (targetPiece) {
        captured = true;
        window.isAnimating = true;
        await playShootingAnimation(startI, startJ, targetI, targetJ);
        window.isAnimating = false;
        addCapturedToPanel(targetPiece);
    } else if (piece.type === PIECES.PAWN && Math.abs(startJ - targetJ) === 1) {
        const capturedPawn = state.board[startI][targetJ];
        if (capturedPawn) {
            captured = true;
            window.isAnimating = true;
            await playShootingAnimation(startI, startJ, startI, targetJ);
            window.isAnimating = false;
            addCapturedToPanel(capturedPawn);
            state.board[startI][targetJ] = null;
        }
    }

    if (piece.type === PIECES.KING && Math.abs(startJ - targetJ) === 2) {
        if (targetJ === 2) {
            state.board[startI][3] = state.board[startI][0];
            state.board[startI][3].moved = true;
            state.board[startI][0] = null;
        } else if (targetJ === 6) {
            state.board[startI][5] = state.board[startI][7];
            state.board[startI][5].moved = true;
            state.board[startI][7] = null;
        }
    }

    state.board[targetI][targetJ] = piece;
    state.board[startI][startJ] = null;
    piece.moved = true;

    if (captured) captureSound.play().catch(e => console.warn(e));
    else moveSound.play().catch(e => console.warn(e));

    const endTurn = (promotionChar = "") => {
        state.lastMove = {
            piece: piece.type,
            color: state.currentTurn,
            startI, startJ, targetI, targetJ
        };
        
        clearDots();
        state.selectedSquare = null;
        
        let notation = getAlgebraic(piece, startI, startJ, targetI, targetJ, captured);
        if (promotionChar) notation += "=" + promotionChar;
        
        state.currentTurn = state.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        
        let kingSq = null;
        for(let r=0; r<8; r++) {
            for(let c=0; c<8; c++) {
                const p = state.board[r][c];
                if(p && p.color === state.currentTurn && p.type === PIECES.KING) { kingSq = {r,c}; break;}
            }
        }
        if (kingSq && isUnderAttack(kingSq.r, kingSq.c, state.currentTurn)) {
            // Need to know if checkmate for '#' but we check mate in postMoveChecks. Just add '+'
            notation += "+";
        }
        
        updateMoveHistory(notation);
        
        state.turnIndicator.innerText = `${state.currentTurn}'s Turn`;
        const repCount = recordPosition();
        if (repCount === 2) {
            showNotification("Position repeated 2 times! One more for a draw.");
        }
        renderBoard();
        postMoveChecks();
        startTimer(); // Ensure timer runs after the first move
    };

    if (piece.type === PIECES.PAWN) {
        if ((state.currentTurn === COLORS.WHITE && targetI === 0) || (state.currentTurn === COLORS.BLACK && targetI === 7)) {
            showPromotionModal(state.currentTurn, (chosenType) => {
                piece.type = chosenType;
                let char = chosenType === PIECES.HORSE ? 'N' : chosenType[0];
                endTurn(char);
            });
            return;
        }
    }

    endTurn();
};

const addCapturedToPanel = (piece) => {
    const img = document.createElement('img');
    img.src = `./pngs/${piece.color}${piece.type}.png`;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.cursor = 'default';
    img.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    img.style.borderRadius = '4px';
    img.style.padding = '2px';
    
    if (piece.color === COLORS.WHITE) {
        state.leftPanel.appendChild(img);
    } else {
        state.rightPanel.appendChild(img);
    }
};

const updateMoveHistory = (notation) => {
    if (state.currentTurn === COLORS.BLACK) {
        const m = { white: notation, black: "" };
        state.moveList.push(m);
        renderMoveHistory();
    } else {
        state.moveList[state.moveList.length-1].black = notation;
        renderMoveHistory();
    }
};

const renderMoveHistory = () => {
    const panel = state.moveHistoryPanel;
    panel.innerHTML = "";
    state.moveList.forEach((m, idx) => {
        const row = document.createElement("div");
        row.className = "move-row";
        row.innerHTML = `<span class="move-number">${idx+1}.</span><span class="move-white">${m.white}</span><span class="move-black">${m.black}</span>`;
        panel.appendChild(row);
    });
    panel.scrollTop = panel.scrollHeight;
};
