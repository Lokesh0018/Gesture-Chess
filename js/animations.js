import { getSquare } from './dom.js';
import { state } from './state.js';

/**
 * Main animation orchestrator.
 */
export const playMoveAnimation = (startI, startJ, targetI, targetJ, pieceType, isCapture) => {
    return new Promise(resolve => {
        const attackerSq = getSquare(startI, startJ);
        const targetSq = getSquare(targetI, targetJ);
        if (!attackerSq || !targetSq) {
            resolve();
            return;
        }

        const pieceImg = attackerSq.querySelector('img:not(.particle):not(.shockwave)');
        if (!pieceImg) {
            resolve();
            return;
        }

        const attRect = attackerSq.getBoundingClientRect();
        const tgtRect = targetSq.getBoundingClientRect();
        const dx = tgtRect.left - attRect.left;
        const dy = tgtRect.top - attRect.top;

        // Determine personality
        let duration = 300;
        let easing = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
        let needsArc = false;
        let blurClass = '';
        let needsAnticipation = true;

        switch (pieceType.toLowerCase()) {
            case 'pawn':
                duration = 200;
                easing = 'linear';
                needsAnticipation = false;
                break;
            case 'horse':
                duration = 400;
                needsArc = true;
                easing = 'cubic-bezier(0.25, 1, 0.5, 1)';
                break;
            case 'bishop':
                duration = 350;
                blurClass = 'motion-blur-light';
                easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
                break;
            case 'rook':
                duration = 400;
                easing = 'cubic-bezier(0.5, 0, 0.1, 1)';
                needsAnticipation = true;
                break;
            case 'queen':
                duration = 250;
                blurClass = 'motion-blur-heavy';
                easing = 'cubic-bezier(0.8, 0, 0.2, 1)';
                needsAnticipation = true;
                break;
            case 'king':
                duration = 500;
                easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
                needsAnticipation = true;
                break;
        }

        // Apply blur
        if (blurClass) pieceImg.classList.add(blurClass);

        // Calculate sequence
        const sequence = [];
        
        if (needsAnticipation) {
            // Pull back slightly opposite to direction
            const normX = dx === 0 ? 0 : dx / Math.abs(dx);
            const normY = dy === 0 ? 0 : dy / Math.abs(dy);
            sequence.push({
                transform: `translate(${-normX * 10}px, ${-normY * 10}px)`,
                offset: 0.15
            });
        }

        if (needsArc) {
            // High arc
            sequence.push({
                transform: `translate(${dx / 2}px, ${dy / 2 - 50}px) scale(1.2)`,
                offset: 0.5
            });
        }

        sequence.push({
            transform: `translate(${dx}px, ${dy}px) scale(1)`,
            offset: 1
        });

        const anim = pieceImg.animate([
            { transform: 'translate(0, 0) scale(1)', offset: 0 },
            ...sequence
        ], {
            duration: duration,
            easing: easing,
            fill: 'forwards'
        });

        anim.onfinish = () => {
            if (blurClass) pieceImg.classList.remove(blurClass);
            if (isCapture) {
                // If it's a capture, trigger combat
                playCombatAnimation(attackerSq, targetSq, pieceImg, resolve);
            } else {
                triggerShockwave(targetSq);
                resolve();
            }
        };
    });
};

const playCombatAnimation = (attackerSq, targetSq, pieceImg, resolve) => {
    const color = state.currentTurn;
    const weapons = [`${color}Gun.png`, 'gun.png', 'knife.png', 'missile.png', 'hand-grenade.png', 'bomb.png', 'star.png', 'sight.png'];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    const isGun = randomWeapon.toLowerCase().includes('gun');
    
    // Target Lock
    const targetLock = document.createElement('div');
    targetLock.className = 'target-lock';
    targetSq.appendChild(targetLock);

    const weaponNode = document.createElement('img');
    weaponNode.src = `./pngs/${randomWeapon}`;
    weaponNode.style.position = 'absolute';
    weaponNode.style.width = '30px'; 
    weaponNode.style.height = 'auto';
    weaponNode.style.zIndex = '100';
    weaponNode.style.left = '50%';
    weaponNode.style.top = '50%';
    
    // Weapon appears at the target location (since the piece just moved there in the DOM coordinates, 
    // actually pieceImg is visually at targetSq but physically in attackerSq).
    // Wait, playShootingAnimation used to be called BEFORE movePiece. Now playMoveAnimation moves the piece visually, 
    // but the piece is physically still in attackerSq.
    // It's easier to append the weapon to targetSq directly, but we want it to look like it's held by the attacker.
    
    const attRect = attackerSq.getBoundingClientRect();
    const tgtRect = targetSq.getBoundingClientRect();
    // Since piece is visually at targetSq right now, we attach weapon to targetSq, but offset to edge.
    // But wait, the attacker is about to "capture" the target. So the attacker just moved TO the target?
    // No, if the attacker just moved to the target, the combat shouldn't happen AFTER moving. Combat usually happens BEFORE moving!
    // Ah, combat before moving makes more sense. Let's fire the weapon, THEN jump?
    // Let's resolve combat first, then resolve the move? 
    // For now, if we already moved, we are physically at attackerSq but visually at targetSq.
    // Let's just create an explosion and shatter the enemy right at targetSq.
    
    setTimeout(() => {
        if(targetLock.parentNode) targetLock.parentNode.removeChild(targetLock);
        createParticles(targetSq);
        triggerShockwave(targetSq);
        showExplosion(targetSq, () => {
            resolve();
        });
    }, 400);
};

const showExplosion = (tSq, res) => {
    const explosions = ['blasting.png', 'explosion.png', 'nuclear-explosion.png'];
    const randomExplosion = explosions[Math.floor(Math.random() * explosions.length)];
    
    const bang = document.createElement('img');
    bang.src = `./pngs/${randomExplosion}`;
    bang.style.position = 'absolute';
    bang.style.width = '60px';
    bang.style.height = 'auto';
    bang.style.zIndex = '100';
    bang.style.left = '50%';
    bang.style.top = '50%';
    bang.style.transform = 'translate(-50%, -50%) scale(0)';
    bang.style.transition = 'transform 0.1s';
    tSq.appendChild(bang);
    
    requestAnimationFrame(() => {
        bang.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });

    const tgtImgReal = Array.from(tSq.querySelectorAll('img:not(.particle):not(.shockwave)')).find(img => img.dataset && img.dataset.value);
    if (tgtImgReal) {
        tgtImgReal.style.transition = 'opacity 0.2s, transform 0.2s';
        tgtImgReal.style.opacity = '0';
        tgtImgReal.style.transform = 'scale(0.5)';
    }

    setTimeout(() => {
        if(bang.parentNode) bang.parentNode.removeChild(bang);
        res();
    }, 300);
};

const createParticles = (sq) => {
    const rect = sq.getBoundingClientRect();
    const tgtImg = Array.from(sq.querySelectorAll('img')).find(img => img.dataset && img.dataset.value);
    const color = tgtImg && tgtImg.classList.contains('white') ? '#ebecd0' : '#739552';

    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.left = '50%';
        p.style.top = '50%';
        sq.appendChild(p);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 20 + Math.random() * 40;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;

        p.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
        ], {
            duration: 300 + Math.random() * 200,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
            fill: 'forwards'
        });

        setTimeout(() => {
            if (p.parentNode) p.parentNode.removeChild(p);
        }, 600);
    }
};

const triggerShockwave = (sq) => {
    const wave = document.createElement('div');
    wave.className = 'shockwave';
    sq.appendChild(wave);

    requestAnimationFrame(() => {
        wave.style.transform = 'translate(-50%, -50%) scale(10)';
        wave.style.opacity = '0';
    });

    setTimeout(() => {
        if (wave.parentNode) wave.parentNode.removeChild(wave);
    }, 400);
};
