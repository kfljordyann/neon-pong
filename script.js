 const canvas = document.getElementById("pongCanvas");
        const ctx = canvas.getContext("2d");
        
        // Objets du jeu
        const ball = { x: 400, y: 250, radius: 10, speedX: 5, speedY: 5, color: "#fff" };
        const p1 = { x: 10, y: 200, w: 15, h: 80, score: 0, color: "#00d2ff" };
        const p2 = { x: 775, y: 200, w: 15, h: 80, score: 0, color: "#ff007f" };
        
        // Variables d'état
        let gameRunning = false;
        let mode = "p1vIA";
        let difficulty = 0.1;
        let keys = {};
        let name1 = "", name2 = "";

        // Listeners Clavier
        window.addEventListener("keydown", e => keys[e.key] = true);
        window.addEventListener("keyup", e => keys[e.key] = false);
        
        // Listeners tactiles
        canvas.addEventListener("touchstart", handleTouch, {passive: false});
        canvas.addEventListener("touchmove", handleTouch, {passive: false});

         function handleTouch(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const scaleY = canvas.height / rect.height;
            
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                const touchX = touch.clientX - rect.left;
                const touchY = (touch.clientY - rect.top) * scaleY;

                // Côté gauche (J1)
                if (touchX < rect.width / 2) {
                    if (mode !== "iavia") p1.y = touchY - p1.h / 2;
                } 
                // Côté droit (J2)
                else {
                    if (mode === "p1vp2") p2.y = touchY - p2.h / 2;
                }
            }
        }

        function startGame() {
            name1 = document.getElementById("p1Name").value || "J1";
            name2 = document.getElementById("p2Name").value || "IA";
            mode = document.getElementById("gameMode").value;
            difficulty = parseFloat(document.getElementById("difficulty").value);

            document.getElementById("menu").style.display = "none";
            document.getElementById("game-container").style.display = "block";
            
            resetBall();
            p1.score = 0;
            p2.score = 0;
            updateScoreDisplay();
            gameRunning = true;
            requestAnimationFrame(gameLoop);
        }

        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.speedX = (Math.random() > 0.5 ? 5 : -5);
            ball.speedY = (Math.random() * 6 - 3);
        }

        function movePaddles() {
            // Joueur 1 (Z / S ou IA)
            if (mode === "iavia") {
                p1.y += (ball.y - (p1.y + p1.h / 2)) * difficulty;
            } else {
                if (keys["s"] || keys["S"]) p1.y -= 7;
                if (keys["z"] || keys["Z"]) p1.y += 7;
            }

            // Joueur 2 (Flèches ou IA)
            if (mode === "p1vIA" || mode === "iavia") {
                p2.y += (ball.y - (p2.y + p2.h / 2)) * difficulty;
            } else {
                if (keys["ArrowUp"]) p2.y -= 7;
                if (keys["ArrowDown"]) p2.y += 7;
            }

            // Limites
            [p1, p2].forEach(p => {
                if (p.y < 0) p.y = 0;
                if (p.y + p.h > canvas.height) p.y = canvas.height - p.h;
            });
        }

        function update() {
            if (!gameRunning) return;

            ball.x += ball.speedX;
            ball.y += ball.speedY;

            // Rebond murs
            if (ball.y <= 0 || ball.y >= canvas.height) ball.speedY *= -1;

            // Collision Raquettes
            let paddle = (ball.x < canvas.width / 2) ? p1 : p2;
            if (checkCollision(ball, paddle)) {
                let collidePoint = ball.y - (paddle.y + paddle.h / 2);
                collidePoint = collidePoint / (paddle.h / 2);
                let angleRad = (Math.PI / 4) * collidePoint;
                let direction = (ball.x < canvas.width / 2) ? 1 : -1;
                
                ball.speedX = direction * Math.cos(angleRad) * 8;
                ball.speedY = Math.sin(angleRad) * 8;
                ball.speedX *= 1.05; // Accélération progressive
            }

            // Score
            if (ball.x < 0) {
                p2.score++;
                checkWin();
                resetBall();
            } else if (ball.x > canvas.width) {
                p1.score++;
                checkWin();
                resetBall();
            }
            updateScoreDisplay();
        }

        function checkCollision(b, p) {
            return b.x < p.x + p.w && b.x + b.radius > p.x && b.y < p.y + p.h && b.y + b.radius > p.y;
        }

        function checkWin() {
            if (p1.score >= 5 || p2.score >= 5) {
                gameRunning = false;
                const winner = p1.score >= 5 ? name1 : name2;
                const loser = p1.score >= 5 ? name2 : name1;
                showWinner(winner, loser);
            }
        }

        function showWinner(win, los) {
            document.getElementById("winner-screen").style.display = "block";
            document.getElementById("winner-text").innerText = `${win.toUpperCase()} ....no shori!`;
            document.getElementById("match-details").innerText = `${win} biito ${los} (${p1.score} - ${p2.score})`;
        }

        function draw() {
            // Fond dégradé
            let grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, "#0a0a0c");
            grad.addColorStop(0.5, "#1a1a2e");
            grad.addColorStop(1, "#0a0a0c");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Ligne centrale
            ctx.setLineDash([10, 10]);
            ctx.strokeStyle = "rgba(157, 0, 255, 0.3)";
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            // Raquettes avec effet néon
            drawRect(p1.x, p1.y, p1.w, p1.h, p1.color);
            drawRect(p2.x, p2.y, p2.w, p2.h, p2.color);

            // Balle néon
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#fff";
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        function drawRect(x, y, w, h, color) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
            ctx.shadowBlur = 0;
        }

        function updateScoreDisplay() {
            document.getElementById("score1").innerText = p1.score;
            document.getElementById("score2").innerText = p2.score;
        }

        function resetMenu() {
            document.getElementById("winner-screen").style.display = "none";
            document.getElementById("game-container").style.display = "none";
            document.getElementById("menu").style.display = "flex";
        }

        function gameLoop() {
            if (!gameRunning) return;
            movePaddles();
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }