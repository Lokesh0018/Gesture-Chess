const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomGameSetup.tsx', 'utf8');

// Remove useRef
code = code.replace(/, useRef/g, '');

// Remove unused Lucide imports
const unusedIcons = ['MousePointer2', 'RefreshCw', 'Hand', 'Info', 'ChevronDown', 'ChevronRight', 'Zap'];
unusedIcons.forEach(icon => {
  code = code.replace(new RegExp(icon + '[,]?[ ]?', 'g'), '');
});

// Remove positionToFen
code = code.replace(/function positionToFen[\s\S]*?return fen \+ ' w - - 0 1';\s*}\s*/, '');

// Remove unused states
const statesToRemove = ['castleWK', 'castleWQ', 'castleBK', 'castleBQ', 'enPassant', 'pawnPromotion', 'advancedRulesOpen', 'setAdvancedRulesOpen', 'arsenalTab', 'setArsenalTab'];
statesToRemove.forEach(state => {
  const regex = new RegExp('const \\[' + state + ', set[a-zA-Z]+\\] = useState\\([^)]*\\);\\n?', 'g');
  code = code.replace(regex, '');
});

// Remove fillEmpty
code = code.replace(/const fillEmpty = \(\) => {[\s\S]*?updatePosition\(newPos\);\s*};\s*/, '');

// Remove formatBattleSummary
code = code.replace(/const formatBattleSummary = \(\) => {[\s\S]*?const bSum = getSideSummary\('b'\);\s*return bSum === "0 Pieces" \? wSum : wSum === "0 Pieces" \? bSum : `\$\{wSum\} vs \$\{bSum\}`;\s*};\s*/, '');

fs.writeFileSync('src/pages/CustomGameSetup.tsx', code);
