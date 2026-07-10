const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Capture all console logs
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.text()}`);
  });

  try {
    console.log("Navigating to http://localhost:5173/local...");
    await page.goto('http://localhost:5173/local', { waitUntil: 'networkidle0' });

    console.log("Waiting for chess piece (white pawn on e2)...");
    const pieceSelector = '[data-square="e2"] [data-piece]';
    await page.waitForSelector(pieceSelector, { timeout: 5000 });

    const piece = await page.$(pieceSelector);
    if (!piece) {
      console.log("Piece not found!");
      await browser.close();
      return;
    }

    const targetSquare = await page.$('[data-square="e4"]');
    if (!targetSquare) {
      console.log("Target square not found!");
      await browser.close();
      return;
    }

    console.log("Found piece and target square. Initiating drag-and-drop...");

    const pieceBox = await piece.boundingBox();
    const targetBox = await targetSquare.boundingBox();

    // Move to center of piece, press down, move to center of target, release
    await page.mouse.move(pieceBox.x + pieceBox.width / 2, pieceBox.y + pieceBox.height / 2);
    await page.mouse.down();

    // Slight delay to allow drag to initiate
    await new Promise(r => setTimeout(r, 100));

    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });

    // Slight delay to allow hover state
    await new Promise(r => setTimeout(r, 100));
    await page.mouse.up();

    console.log("Mouse released. Waiting to observe state changes...");
    await new Promise(r => setTimeout(r, 2000));

    // Check if move history updated
    const historyText = await page.evaluate(() => {
      return document.body.innerText.includes('e4');
    });
    console.log("Move history contains e4:", historyText);

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
})();
