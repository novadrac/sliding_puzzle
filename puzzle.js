document.addEventListener("DOMContentLoaded", function() {
    const puzzleContainer = document.getElementById("puzzle");
    const pieces = [];
    const width = 3;
    const height = 3;
    const pieceWidth = 100;
    const pieceHeight = 100;
    let emptyPiece;
    let lastMovedPiece;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createPuzzle() {
        const image = new Image();
        image.onload = function() {
            const canvas = document.createElement("canvas");
            canvas.width = width * pieceWidth;
            canvas.height = height * pieceHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const piece = document.createElement("div");
                    piece.className = "piece";
                    piece.style.width = pieceWidth + "px";
                    piece.style.height = pieceHeight + "px";
                    piece.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
                    piece.style.backgroundPosition = `-${x * pieceWidth}px -${y * pieceHeight}px`;
                    piece.style.transform = `translate(${x * pieceWidth}px, ${y * pieceHeight}px)`;
                    piece.setAttribute("data-x", x);
                    piece.setAttribute("data-y", y);
                    pieces.push(piece);
                }
            }
            // Mélanger toutes les pièces, y compris l'emplacement vide
            shuffle(pieces);

            // Trouver l'emplacement vide et le marquer
            emptyPiece = pieces.find(piece => piece.getAttribute("data-x") === "2" && piece.getAttribute("data-y") === "2");
            emptyPiece.classList.add("empty");

            // Afficher les pièces mélangées
            pieces.forEach(piece => puzzleContainer.appendChild(piece));
            pieces.forEach(piece => piece.addEventListener("click", handleClick));
        };
        image.src = "puzzle.svg";
    }

    function handleClick() {
        if (isSolved()) {
            return; // Si le puzzle est résolu, ne rien faire
        }

        const x = parseInt(this.getAttribute("data-x"));
        const y = parseInt(this.getAttribute("data-y"));
        const pieceX = parseInt(emptyPiece.getAttribute("data-x"));
        const pieceY = parseInt(emptyPiece.getAttribute("data-y"));

        if ((x === pieceX && Math.abs(y - pieceY) === 1) ||
            (y === pieceY && Math.abs(x - pieceX) === 1)) {
            // Échanger les positions
            const tempX = this.style.transform;
            this.style.transform = emptyPiece.style.transform;
            emptyPiece.style.transform = tempX;
            [this.dataset.x, emptyPiece.dataset.x] = [emptyPiece.dataset.x, this.dataset.x];
            [this.dataset.y, emptyPiece.dataset.y] = [emptyPiece.dataset.y, this.dataset.y];
            lastMovedPiece = this;
        }

        if (isSolved()) {
            alert("Félicitations ! Puzzle résolu !");
        }
    }

    function isSolved() {
        const puzzlePieces = Array.from(document.querySelectorAll(".piece"));
        for (let i = 0; i < puzzlePieces.length; i++) {
            if (parseInt(puzzlePieces[i].dataset.x) !== i % 3 || parseInt(puzzlePieces[i].dataset.y) !== Math.floor(i / 3)) {
                return false;
            }
        }
        return true;
    }

    function moveRandomPiece() {
        if (!isSolved()) {
            const movablePieces = getMovablePieces().filter(piece => piece !== lastMovedPiece);
            if (movablePieces.length > 0) {
                const randomPiece = movablePieces[Math.floor(Math.random() * movablePieces.length)];
                simulateClick(randomPiece);
            }
        }
    }

    function getMovablePieces() {
        const movablePieces = [];
        pieces.forEach(piece => {
            const x = parseInt(piece.getAttribute("data-x"));
            const y = parseInt(piece.getAttribute("data-y"));
            const pieceX = parseInt(emptyPiece.getAttribute("data-x"));
            const pieceY = parseInt(emptyPiece.getAttribute("data-y"));
            if ((x === pieceX && Math.abs(y - pieceY) === 1) || (y === pieceY && Math.abs(x - pieceX) === 1)) {
                movablePieces.push(piece);
            }
        });
        return movablePieces;
    }

    function simulateClick(element) {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(event);
    }

    // Créer le puzzle
    createPuzzle();

    // Faire bouger les pièces automatiquement toutes les 1 seconde pendant 5 secondes
    const intervalId = setInterval(moveRandomPiece, 50);
    setTimeout(() => clearInterval(intervalId), 5000);
});
