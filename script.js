const gameContainer = document.getElementById("gameContainer");
const bird = document.getElementById("bird");
const scoreDisplay = document.getElementById("score");
let birdY = 200;
let gravity = 0.6;
let lift = -10;
let velocity = 0;
let isGameOver = false;
let pipeInterval;
let score = 0;

// Fonction de saut
function fly() {
    if (!isGameOver) {
        velocity = lift;
    }
}

// Event listeners pour le clic, la barre d'espace pour voler et 'W' pour tirer
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") fly();
    if (e.code === "KeyW") fireLaser();
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

// Ajustement de la fonction movePipe pour bien nettoyer les tuyaux hors de l'écran
function movePipe(pipeTop, pipeBottom) {
    let pipeX = gameContainer.offsetWidth;
    const pipeSpeed = 2;

    function updatePipe() {
        if (isGameOver) return;
        pipeX -= pipeSpeed;
        pipeTop.style.left = `${pipeX}px`;
        pipeBottom.style.left = `${pipeX}px`;

        if (pipeX < -50) { // Quand le tuyau sort de l'écran, on le retire complètement
            pipeTop.remove();
            pipeBottom.remove();
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        } else {
            checkCollision(pipeTop, pipeBottom);
            requestAnimationFrame(updatePipe);
        }
    }
    updatePipe();
}

// Fonction de collision mise à jour pour ignorer les tuyaux "détruits"
function checkCollision(pipeTop, pipeBottom) {
    const birdRect = bird.getBoundingClientRect();
    const pipeTopRect = pipeTop.getBoundingClientRect();
    const pipeBottomRect = pipeBottom.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    // On ignore les tuyaux avec la classe "destroyed"
    if (pipeTop.classList.contains("destroyed") || pipeBottom.classList.contains("destroyed")) return;

    if (
        birdRect.left < pipeTopRect.right &&
        birdRect.right > pipeTopRect.left &&
        (birdRect.top < pipeTopRect.bottom || birdRect.bottom > pipeBottomRect.top)
    ) {
        endGame();
    }

    if (birdRect.bottom > containerRect.bottom || birdRect.top < containerRect.top) {
        endGame();
    }
}
// Mise à jour de la fonction fireLaser pour la destruction avec explosion
function fireLaser() {
    const laser = document.createElement("div");
    laser.classList.add("laser");
    laser.style.left = `${bird.offsetLeft + bird.offsetWidth}px`;
    laser.style.top = `${bird.offsetTop + bird.offsetHeight / 2}px`;
    gameContainer.appendChild(laser);

    let laserX = bird.offsetLeft + bird.offsetWidth;

    function moveLaser() {
        laserX += 5;
        laser.style.left = `${laserX}px`;

        const pipes = document.querySelectorAll(".pipe");
        pipes.forEach(pipe => {
            const pipeRect = pipe.getBoundingClientRect();
            const laserRect = laser.getBoundingClientRect();

            if (
                laserRect.right > pipeRect.left &&
                laserRect.left < pipeRect.right &&
                laserRect.bottom > pipeRect.top &&
                laserRect.top < pipeRect.bottom
            ) {
                // Appel de la fonction d'explosion
                createExplosion(pipeRect.left, pipeRect.top);

                // Ajout de la classe "destroyed" pour désactiver les hitbox de collision
                pipe.classList.add("destroyed");
                setTimeout(() => pipe.remove(), 50); // Supprime complètement après l'explosion
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                shakeScreen();
                laser.remove();
            }
        });

        if (laserX > gameContainer.offsetWidth) {
            laser.remove();
        } else {
            requestAnimationFrame(moveLaser);
        }
    }
    moveLaser();
}

// Fonction pour créer l'explosion des tuyaux
function createExplosion(x, y) {
    const particleCount = 30;  // Nombre de particules à créer
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");
        particle.style.left = `${x + Math.random() * 50 - 25}px`; // Positionnement aléatoire autour du tuyau
        particle.style.top = `${y + Math.random() * 50 - 25}px`;
        gameContainer.appendChild(particle);

        // Vitesse aléatoire pour chaque particule
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 4 + 3; // Vitesse aléatoire des particules

        // Calcul de la direction des particules
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;

        // Animer les particules
        let particleX = parseFloat(particle.style.left);
        let particleY = parseFloat(particle.style.top);
        let duration = 1000;  // Durée de l'animation (en ms)

        function animateParticle() {
            particleX += velocityX;
            particleY += velocityY;
            particle.style.left = `${particleX}px`;
            particle.style.top = `${particleY}px`;

            // Réduire l'opacité pour donner un effet de disparition
            particle.style.opacity = (duration - Math.abs(particleX - x) - Math.abs(particleY - y)) / 1000;
            duration -= 16;  // Mettre à jour la durée de vie de la particule

            // Supprimer la particule après l'animation
            if (duration <= 0) {
                particle.remove();
            } else {
                requestAnimationFrame(animateParticle);
            }
        }
        animateParticle();
    }
}

function shakeScreen() {
    gameContainer.classList.add("shake");
    setTimeout(() => gameContainer.classList.remove("shake"), 100);
}

function endGame() {
    isGameOver = true;
    clearInterval(pipeInterval);
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

setTimeout(() => {
    pipeInterval = setInterval(createPipe, 2000);
    gameLoop();
}, 500);
