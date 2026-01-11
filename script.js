
const container = document.getElementsByClassName("container");
const board = () => {
    const c1 = container[0];
    let child = "";
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const colorClass = (i + j) % 2 === 0 ? "black" : "white";
            child += `<div class="child ${colorClass}" data-i="${i}" data-j="${j}">${p}</div>`;
        }
    }
    c1.innerHTML = child;
}
window.onload = () => {
    board();
};