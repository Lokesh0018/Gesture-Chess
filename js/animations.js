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
                playCombatAnimation(attackerSq, targetSq, pieceImg, resolve, pieceType);
            } else {
                triggerShockwave(targetSq);
                resolve();
            }
        };
    });
};

const playCombatAnimation = (attackerSq, targetSq, pieceImg, resolve, attackerType) => {
    const pType = (attackerType || '').toLowerCase();

    const container = document.querySelector('.container');
    if (container) {
        container.classList.remove('camera-shake');
        void container.offsetWidth; // trigger reflow
        container.classList.add('camera-shake');
    }

    if (pType === 'bishop') {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.style.position = 'absolute';
        svg.style.width = '100px';
        svg.style.height = '300px';
        svg.style.left = '50%';
        svg.style.bottom = '50%';
        svg.style.transform = 'translate(-50%, 0)';
        svg.style.zIndex = '101';
        svg.style.pointerEvents = 'none';

        const path = document.createElementNS(svgNS, "path");
        let d = "M 50,0 ";
        let currentX = 50;
        for (let y = 20; y <= 300; y += 20) {
            currentX += (Math.random() - 0.5) * 40;
            d += `L ${currentX},${y} `;
        }
        path.setAttribute("d", d);
        path.setAttribute("stroke", "#00ffff");
        path.setAttribute("stroke-width", "4");
        path.setAttribute("fill", "none");
        path.style.filter = "drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 20px #ffffff)";
        
        svg.appendChild(path);
        targetSq.appendChild(svg);

        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.inset = '0';
        flash.style.backgroundColor = 'white';
        flash.style.zIndex = '100';
        targetSq.appendChild(flash);

        svg.animate([
            { opacity: 0 },
            { opacity: 1, offset: 0.1 },
            { opacity: 0, offset: 0.2 },
            { opacity: 1, offset: 0.3 },
            { opacity: 0 }
        ], { duration: 300, fill: 'forwards' });

        flash.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], { duration: 300, fill: 'forwards' });

        setTimeout(() => {
            if(svg.parentNode) svg.parentNode.removeChild(svg);
            if(flash.parentNode) flash.parentNode.removeChild(flash);
            createParticles(targetSq);
            triggerShockwave(targetSq);
            showExplosion(targetSq, resolve);
        }, 300);
        return;
    }

    if (pType === 'queen') {
        const laser = document.createElement('div');
        laser.style.position = 'absolute';
        laser.style.height = '6px';
        laser.style.background = 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,0,0,1) 50%, rgba(255,0,0,0) 100%)';
        laser.style.boxShadow = '0 0 10px #ff0000, 0 0 20px #ff0000';
        laser.style.borderRadius = '3px';
        laser.style.zIndex = '101';
        
        const attRect = attackerSq.getBoundingClientRect();
        const tgtRect = targetSq.getBoundingClientRect();
        const dx = tgtRect.left - attRect.left;
        const dy = tgtRect.top - attRect.top;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx);
        
        laser.style.width = `${dist}px`;
        laser.style.transformOrigin = 'left center';
        laser.style.transform = `translate(0, -50%) rotate(${angle}rad)`;
        laser.style.left = '50%';
        laser.style.top = '50%';
        
        attackerSq.appendChild(laser);

        laser.animate([
            { transform: `translate(0, -50%) rotate(${angle}rad) scaleX(0)`, opacity: 0 },
            { transform: `translate(0, -50%) rotate(${angle}rad) scaleX(1)`, opacity: 1 },
            { transform: `translate(0, -50%) rotate(${angle}rad) scaleX(1)`, opacity: 0 }
        ], { duration: 500, fill: 'forwards' });

        setTimeout(() => {
            if(laser.parentNode) laser.parentNode.removeChild(laser);
            createParticles(targetSq);
            triggerShockwave(targetSq);
            showExplosion(targetSq, resolve);
        }, 500);
        return;
    }

    if (pType === 'horse') {
        for(let i=0; i<30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.backgroundColor = '#654321';
            p.style.width = (Math.random()*8 + 4) + 'px';
            p.style.height = p.style.width;
            p.style.borderRadius = '50%';
            p.style.left = '50%';
            p.style.top = '50%';
            p.style.zIndex = '102';
            targetSq.appendChild(p);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 30 + Math.random() * 60;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity - 20;

            p.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
            ], { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)', fill: 'forwards' });

            setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 1000);
        }

        setTimeout(() => {
            createParticles(targetSq);
            triggerShockwave(targetSq);
            showExplosion(targetSq, resolve);
        }, 300);
        return;
    }

    const color = state.currentTurn;
    const weapons = [`${color}Gun.png`, 'gun.png', 'knife.png', 'missile.png', 'hand-grenade.png', 'bomb.png', 'star.png', 'sight.png'];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    
    const targetLock = document.createElement('div');
    targetLock.className = 'target-lock';
    targetSq.appendChild(targetLock);

    const weaponNode = document.createElement('img');
    weaponNode.src = `./asserts/${randomWeapon}`;
    weaponNode.style.position = 'absolute';
    weaponNode.style.width = '30px'; 
    weaponNode.style.height = 'auto';
    weaponNode.style.zIndex = '100';
    weaponNode.style.left = '50%';
    weaponNode.style.top = '50%';
    
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
    const bang = document.createElement('div');
    bang.style.position = 'absolute';
    bang.style.width = '80px';
    bang.style.height = '80px';
    bang.style.background = 'radial-gradient(circle, rgba(255,200,0,1) 0%, rgba(255,0,0,0.8) 50%, rgba(0,0,0,0) 70%)';
    bang.style.borderRadius = '50%';
    bang.style.zIndex = '100';
    bang.style.left = '50%';
    bang.style.top = '50%';
    bang.style.transform = 'translate(-50%, -50%) scale(0)';
    tSq.appendChild(bang);
    
    bang.animate([
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0.8 },
        { transform: 'translate(-50%, -50%) scale(2)', opacity: 0 }
    ], { duration: 300, easing: 'ease-out', fill: 'forwards' });

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

export const playCastlingRookAnimation = (startI, startJ, targetI, targetJ) => {
    return new Promise(resolve => {
        const rookSq = getSquare(startI, startJ);
        const destSq = getSquare(targetI, targetJ);
        if (!rookSq || !destSq) return resolve();

        const rookImg = rookSq.querySelector('img:not(.particle):not(.shockwave)');
        if (!rookImg) return resolve();

        const rRect = rookSq.getBoundingClientRect();
        const dRect = destSq.getBoundingClientRect();
        const dx = dRect.left - rRect.left;
        const dy = dRect.top - rRect.top;

        const dustInterval = setInterval(() => {
            const dust = document.createElement('div');
            dust.style.position = 'absolute';
            dust.style.width = '20px';
            dust.style.height = '20px';
            dust.style.backgroundColor = 'rgba(200, 200, 200, 0.6)';
            dust.style.borderRadius = '50%';
            dust.style.boxShadow = '0 0 10px rgba(200, 200, 200, 0.4)';
            dust.style.transform = 'translate(-50%, -50%)';
            dust.style.left = '50%';
            dust.style.top = '50%';
            dust.style.pointerEvents = 'none';
            dust.style.zIndex = '90';
            rookSq.appendChild(dust);

            dust.animate([
                { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0.8 },
                { transform: 'translate(-50%, -100%) scale(2.5)', opacity: 0 }
            ], { duration: 600, fill: 'forwards' });

            setTimeout(() => { if (dust.parentNode) dust.parentNode.removeChild(dust); }, 600);
        }, 50);

        const anim = rookImg.animate([
            { transform: 'translate(0, 0)' },
            { transform: `translate(${dx}px, ${dy}px)` }
        ], { duration: 400, easing: 'cubic-bezier(0.5, 0, 0.1, 1)', fill: 'forwards' });

        anim.onfinish = () => {
            clearInterval(dustInterval);
            triggerShockwave(destSq);
            resolve();
        };
    });
};

export const playPromotionAscension = (targetI, targetJ, color, chosenType) => {
    return new Promise(resolve => {
        const sq = getSquare(targetI, targetJ);
        if (!sq) return resolve();

        const oldImg = sq.querySelector('img:not(.particle):not(.shockwave)');
        
        const halo = document.createElement('div');
        halo.style.position = 'absolute';
        halo.style.width = '100px';
        halo.style.height = '300px';
        halo.style.background = 'linear-gradient(to top, rgba(255, 255, 150, 0.9), transparent)';
        halo.style.boxShadow = '0 0 30px rgba(255, 255, 150, 0.5)';
        halo.style.borderRadius = '50px 50px 0 0';
        halo.style.zIndex = '90';
        halo.style.left = '50%';
        halo.style.bottom = '0%';
        halo.style.transform = 'translate(-50%, 0) scaleY(0)';
        halo.style.transformOrigin = 'bottom center';
        sq.appendChild(halo);

        halo.animate([
            { transform: 'translate(-50%, 0) scaleY(0)', opacity: 0 },
            { transform: 'translate(-50%, 0) scaleY(1)', opacity: 0.8 }
        ], { duration: 400, fill: 'forwards' });

        if (oldImg) {
            oldImg.animate([
                { transform: 'translate(0, 0)', opacity: 1 },
                { transform: 'translate(0, -100px)', opacity: 0 }
            ], { duration: 600, delay: 200, fill: 'forwards' });
        }

        setTimeout(() => {
            createParticles(sq);
            if (oldImg && oldImg.parentNode) oldImg.parentNode.removeChild(oldImg);

            const newImg = document.createElement('img');
            newImg.src = `./asserts/${color}${chosenType}.png`;
            newImg.style.position = 'absolute';
            newImg.style.width = '85%';
            newImg.style.height = '85%';
            newImg.style.zIndex = '95';
            newImg.style.left = '50%';
            newImg.style.top = '50%';
            sq.appendChild(newImg);

            newImg.animate([
                { transform: 'translate(-50%, -150%)', opacity: 0 },
                { transform: 'translate(-50%, -50%)', opacity: 1 }
            ], { duration: 500, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });

            halo.animate([
                { transform: 'translate(-50%, 0) scaleY(1)', opacity: 0.8 },
                { transform: 'translate(-50%, 0) scaleY(0)', opacity: 0 }
            ], { duration: 400, delay: 500, fill: 'forwards' }).onfinish = () => {
                if (halo.parentNode) halo.parentNode.removeChild(halo);
                resolve();
            };
        }, 800);
    });
};
