const chars = 'abcdefghijklmnopqrstuvwxyz';
let isRunning = false;

function startAttack() {
    const target = document.getElementById('targetPassword').value.toLowerCase();
    const attackBtn = document.getElementById('attackBtn');
    const logConsole = document.getElementById('logConsole');
    const currentGuessDisplay = document.getElementById('currentGuess');
    const attemptDisplay = document.getElementById('attemptCount');
    const timeDisplay = document.getElementById('timeElapsed');
    const resultMsg = document.getElementById('resultMessage');

    // Validation
    if (!target || target.length > 4) {
        alert("For this browser simulation, please enter 1-4 letters.");
        return;
    }

    // Reset UI
    isRunning = true;
    attackBtn.disabled = true;
    resultMsg.textContent = "";
    resultMsg.style.color = "inherit";
    log("Starting brute-force sequence on target: " + "*".repeat(target.length));
    
    let startTime = Date.now();
    let attempts = 0;
    
    // We use an async loop to prevent freezing the browser UI
    const queue = generateCombinations(target.length);
    
    function nextBatch() {
        if (!isRunning) return;

        // Process a batch of guesses (speed simulation)
        for (let i = 0; i < 500; i++) { 
            const result = queue.next();
            
            if (result.done) {
                fail();
                return;
            }

            const guess = result.value;
            attempts++;
            
            // Update Visuals every 100 attempts to keep UI smooth
            if (attempts % 100 === 0) {
                currentGuessDisplay.textContent = guess;
                attemptDisplay.textContent = attempts;
                timeDisplay.textContent = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
            }

            // Check for Match
            if (guess === target) {
                success(guess, attempts, startTime);
                return;
            }
        }
        
        // Request next animation frame to keep loop running
        requestAnimationFrame(nextBatch); 
    }

    nextBatch();
}

// Generator function to create combinations (a, b, c ... aa, ab ...)
function* generateCombinations(length) {
    function* recurse(prefix, k) {
        if (k === 0) {
            yield prefix;
            return;
        }
        for (let i = 0; i < chars.length; i++) {
            yield* recurse(prefix + chars[i], k - 1);
        }
    }

    // Try length 1, then length 2, up to target length
    for (let len = 1; len <= length; len++) {
        yield* recurse("", len);
    }
}

function success(password, attempts, startTime) {
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
    
    document.getElementById('currentGuess').textContent = password;
    document.getElementById('resultMessage').textContent = "MATCH FOUND!";
    document.getElementById('resultMessage').style.color = "#7ee787"; // Green
    document.getElementById('attackBtn').disabled = false;
    
    log(`SUCCESS: Password cracked: '${password}'`);
    log(`Stats: ${attempts} attempts in ${timeTaken} seconds.`);
    isRunning = false;
}

function log(msg) {
    const consoleDiv = document.getElementById('logConsole');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `> ${msg}`;
    consoleDiv.appendChild(entry);
    consoleDiv.scrollTop = consoleDiv.scrollHeight; // Auto scroll
}