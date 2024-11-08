const gameContainer = document.getElementById("gameContainer");
const bird = document.getElementById("bird");
const scoreDisplay = document.getElementById("score"); // Élément pour afficher le score
let birdY = 200;
let gravity = 0.6;
let lift = -10;
let velocity = 0;
let isGameOver = false;
let pipeInterval;
let score = 0; // Initialisation du score

// Fonction de saut
function fly() {
    if (!isGameOver) {
        velocity = lift;
    }
}

// Event listeners pour le clic et la barre d'espace pour faire voler l'oiseau
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") fly();
});

document.addEventListener("click", fly);

function createPipe() {
    const pipeGap = 150;
    const pipePosition = gameContainer.offsetWidth;
    const pipeTopHeight = Math.floor(Math.random() * (gameContainer.offsetHeight - pipeGap));
    const pipeBottomHeight = gameContainer.offsetHeight - pipeGap - pipeTopHeight;

    const pipeTop = document.createElement("div");
    pipeTop.classList.add("pipe", "pipe-top");
    pipeTop.style.left = `${pipePosition}px`;
    pipeTop.style.height = `${pipeTopHeight}px`;

    const pipeBottom = document.createElement("div");
    pipeBottom.classList.add("pipe", "pipe-bottom");
    pipeBottom.style.left = `${pipePosition}px`;
    pipeBottom.style.height = `${pipeBottomHeight}px`;

    gameContainer.appendChild(pipeTop);
    gameContainer.appendChild(pipeBottom);

    movePipe(pipeTop, pipeBottom);
}

function movePipe(pipeTop, pipeBottom) {
    let pipeX = gameContainer.offsetWidth;
    const pipeSpeed = 2;

    function updatePipe() {
        if (isGameOver) return;
        pipeX -= pipeSpeed;
        pipeTop.style.left = `${pipeX}px`;
        pipeBottom.style.left = `${pipeX}px`;

        if (pipeX < -50) { // Quand le tuyau sort de l'écran
            pipeTop.remove();
            pipeBottom.remove();
            // Augmente le score quand l'oiseau franchit le tuyau
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        } else {
            checkCollision(pipeTop, pipeBottom);
            requestAnimationFrame(updatePipe);
        }
    }
    updatePipe();
}

function checkCollision(pipeTop, pipeBottom) {
    const birdRect = bird.getBoundingClientRect();
    const pipeTopRect = pipeTop.getBoundingClientRect();
    const pipeBottomRect = pipeBottom.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    // Vérification de collision avec les tuyaux
    if (
        birdRect.left < pipeTopRect.right &&
        birdRect.right > pipeTopRect.left &&
        (birdRect.top < pipeTopRect.bottom || birdRect.bottom > pipeBottomRect.top)
    ) {
        endGame();
    }

    // Vérification de collision avec le haut ou le bas du conteneur
    if (birdRect.bottom > containerRect.bottom || birdRect.top < containerRect.top) {
        endGame();
    }
}

function endGame() {
    isGameOver = true;
    clearInterval(pipeInterval); // Stopper la génération des tuyaux
    alert(`Game Over! Votre score est de : ${score}`);
    window.location.reload();
}

function gameLoop() {
    if (!isGameOver) {
        velocity += gravity;
        birdY += velocity;
        bird.style.top = `${birdY}px`;

        if (birdY >= gameContainer.offsetHeight) {
            endGame();
        }

        requestAnimationFrame(gameLoop);
    }
}

// Démarrage du jeu après un délai de 500 ms
setTimeout(() => {
    pipeInterval = setInterval(createPipe, 2000);
    gameLoop();
}, 500);
