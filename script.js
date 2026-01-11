
const container = document.getElementsByClassName("container");
const board = () => {
    const c1 = container[0];
    let child = "";
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const colorClass = (i + j) % 2 === 0 ? "black" : "white";
            let p = "";
            if ((i === 0 && j === 0) || (i === 0 && j === 7))
                p = `<img src="./pieces/BlackRook.png" data-i="${i}" data-j="${j}" data-value="Rook" class="Black"/>`;
            if ((i === 7 && j === 0) || (i === 7 && j === 7))
                p = `<img src="./pieces/WhiteRook.png" data-i="${i}" data-j="${j}" data-value="Rook" class="White"/>`;
            if ((i === 0 && j === 1) || (i === 0 && j === 6))
                p = `<img src="./pieces/BlackHorse.png" data-i="${i}" data-j="${j}" data-value="Horse" class="Black"/>`;
            if ((i === 7 && j === 1) || (i === 7 && j === 6))
                p = `<img src="./pieces/WhiteHorse.png" data-i="${i}" data-j="${j}" data-value="Horse" class="White"/>`;
            if ((i === 0 && j === 2) || (i === 0 && j === 5))
                p = `<img src="./pieces/BlackBishop.png" data-i="${i}" data-j="${j}" data-value="Bishop" class="Black"/>`;
            if ((i === 7 && j === 2) || (i === 7 && j === 5))
                p = `<img src="./pieces/WhiteBishop.png" data-i="${i}" data-j="${j}" data-value="Bishop" class="White"/>`;
            if (i === 0 && j === 3)
                p = `<img src="./pieces/BlackKing.png" data-i="${i}" data-j="${j}" data-value="King" class="Black"/>`;
            if (i === 7 && j === 3)
                p = `<img src="./pieces/WhiteKing.png" data-i="${i}" data-j="${j}" data-value="King" class="White"/>`;
            if (i === 0 && j === 4)
                p = `<img src="./pieces/BlackQueen.png" data-i="${i}" data-j="${j}" data-value="Queen" class="Black"/>`;
            if (i === 7 && j === 4)
                p = `<img src="./pieces/WhiteQueen.png" data-i="${i}" data-j="${j}" data-value="Queen" class="White"/>`;
            if (i === 1)
                p = `<img src="./pieces/BlackPawn.png" data-i="${i}" data-j="${j}" data-value="Pawn" class="Black"/>`;
            if (i === 6)
                p = `<img src="./pieces/WhitePawn.png" data-i="${i}" data-j="${j}" data-value="Pawn" class="White"/>`;
            child += `<div class="child ${colorClass}" data-i="${i}" data-j="${j}">${p}</div>`;
        }
    }
    c1.innerHTML = child;
}
window.onload = () => {
    board();
    let choice = true;

    document.querySelector(".container").addEventListener("click", (e) => {
        const piece = e.target;

        if (!piece.matches("img")) return;

        if (choice && piece.classList.contains("White")) {
            console.log(piece.className, piece.dataset.value);
            if(piece.dataset.value === "Pawn"){
                const i = piece.dataset.i;
                const j = piece.dataset.j;
                if(i==6){
                    const m1 = document.querySelectorAll(`[data-i="5"][data-j="${j}"]`)[0];
                    m1.classList.add("dot");
                    const m2 = document.querySelectorAll(`[data-i="4"][data-j="${j}"]`)[0];
                    m2.classList.add("dot");
                }
            }
            choice = false;
        }
        else if (!choice && piece.classList.contains("Black")) {
            console.log(piece.className, piece.dataset.value);
            choice = true;
        }
    });
};