window.addEventListener('error', (e) => {
    alert('JavaScript Error: ' + e.message + ' at ' + e.filename + ':' + e.lineno);
});

document.addEventListener('DOMContentLoaded', () => {
    const sidebarItems = document.querySelectorAll('.draggable-item');
    const canvas = document.getElementById('canvas');
    const svgLayer = document.getElementById('connections-layer');
    
    let nodeIdCounter = 0;
    const nodes = {}; // Store node data: { id: { el, x, y } }
    const connections = []; // Store lines: { from: nodeId, fromDot: 'right', to: nodeId, toDot: 'left', pathEl }

    const canvasContainer = document.getElementById('canvas-container');

    // --- Drag from Sidebar to Canvas ---
    
    sidebarItems.forEach(item => {
        // Add draggable attribute so it works with HTML5 drag and drop
        item.setAttribute('draggable', true);
        
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
            item.style.opacity = '0.5';
        });

        item.addEventListener('dragend', (e) => {
            item.style.opacity = '1';
        });

        // Fallback: Click to add to center of canvas
        item.addEventListener('click', () => {
            try {
                const rect = canvas.getBoundingClientRect();
                const x = rect.width / 2 + (Math.random() * 40 - 20); // slight random offset
                const y = rect.height / 2 + (Math.random() * 40 - 20);
                createNode(item.dataset.type, x, y);
            } catch (err) {
                alert('Error creating node on click: ' + err.message);
            }
        });
    });

    canvasContainer.addEventListener('dragenter', (e) => {
        e.preventDefault();
    });

    canvasContainer.addEventListener('dragover', (e) => {
        e.preventDefault(); // allow drop
        e.dataTransfer.dropEffect = 'copy';
    });

    canvasContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        if (!type) return;

        // Get drop position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        createNode(type, x, y);
    });

    // --- Node Creation ---

    function createNode(type, x, y) {
        const id = 'node-' + (nodeIdCounter++);
        
        // Setup Element
        const el = document.createElement('div');
        el.className = 'canvas-node';
        el.id = id;
        el.style.left = x + 'px';
        el.style.top = y + 'px';

        let icon = '☁️';
        let label = 'Cloud';
        
        if(type === 'load-balancer') { icon = '⚖️'; label = 'Load Balancer'; }
        if(type === 'web-server') { icon = '🖥️'; label = 'Web Server'; }
        if(type === 'database') { icon = '🗄️'; label = 'Database'; }
        if(type === 'cache') { icon = '⚡'; label = 'Cache'; }
        if(type === 'user') { icon = '👤'; label = 'User'; }

        el.innerHTML = `
            <div class="icon">${icon}</div>
            <div class="label">${label}</div>
            <div class="connector-dot top" data-pos="top"></div>
            <div class="connector-dot right" data-pos="right"></div>
            <div class="connector-dot bottom" data-pos="bottom"></div>
            <div class="connector-dot left" data-pos="left"></div>
        `;

        canvas.appendChild(el);
        
        nodes[id] = { el, x, y, type };

        setupNodeDragging(el, id);
        setupNodeConnecting(el, id);
    }

    // --- Node Dragging (within canvas) ---

    function setupNodeDragging(el, id) {
        let isDragging = false;
        let startX, startY;

        el.addEventListener('mousedown', (e) => {
            if(e.target.classList.contains('connector-dot')) return; // handled by connector logic
            isDragging = true;
            startX = e.clientX - nodes[id].x;
            startY = e.clientY - nodes[id].y;
            el.style.zIndex = 100; // bring to front
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const x = e.clientX - startX;
            const y = e.clientY - startY;
            
            nodes[id].x = x;
            nodes[id].y = y;
            
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            
            updateConnections();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                el.style.zIndex = 10;
            }
        });
    }

    // --- Drawing Connections ---

    let connectingState = null; // { fromId, fromDot, pathEl }

    function setupNodeConnecting(el, id) {
        const dots = el.querySelectorAll('.connector-dot');
        
        dots.forEach(dot => {
            dot.addEventListener('mousedown', (e) => {
                e.stopPropagation(); // prevent node drag
                
                const pos = dot.dataset.pos;
                
                // Create temp path
                const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathEl.classList.add('line');
                svgLayer.appendChild(pathEl);
                
                connectingState = {
                    fromId: id,
                    fromDot: pos,
                    pathEl: pathEl
                };
            });

            dot.addEventListener('mouseup', (e) => {
                e.stopPropagation();
                if (connectingState && connectingState.fromId !== id) {
                    
                    // Create group for permanent connection
                    const gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    gEl.classList.add('connection-group');
                    
                    const lineEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    lineEl.classList.add('line');
                    
                    const hitboxEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    hitboxEl.classList.add('hitbox');
                    
                    const deleteUi = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    deleteUi.classList.add('delete-ui');
                    
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute('r', '12');
                    circle.setAttribute('fill', '#ef4444');
                    
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.textContent = "×";
                    text.setAttribute('fill', 'white');
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('dominant-baseline', 'central');
                    text.setAttribute('font-size', '16px');
                    text.setAttribute('font-weight', 'bold');
                    
                    deleteUi.appendChild(circle);
                    deleteUi.appendChild(text);
                    
                    gEl.appendChild(lineEl);
                    gEl.appendChild(hitboxEl);
                    gEl.appendChild(deleteUi);
                    
                    svgLayer.appendChild(gEl);
                    
                    const newConnection = {
                        from: connectingState.fromId,
                        fromDot: connectingState.fromDot,
                        to: id,
                        toDot: dot.dataset.pos,
                        gEl: gEl,
                        lineEl: lineEl,
                        hitboxEl: hitboxEl,
                        deleteUi: deleteUi
                    };
                    
                    connections.push(newConnection);
                    
                    // Delete event listener
                    deleteUi.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        gEl.remove();
                        const idx = connections.indexOf(newConnection);
                        if(idx > -1) connections.splice(idx, 1);
                    });

                    // Remove temporary line
                    connectingState.pathEl.remove();
                    connectingState = null;
                    updateConnections();
                }
            });
        });
    }

    // Handle dragging the connection line before it's attached
    canvas.addEventListener('mousemove', (e) => {
        if (connectingState) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const startPt = getDotCenter(connectingState.fromId, connectingState.fromDot);
            
            drawPath(connectingState.pathEl, startPt.x, startPt.y, mouseX, mouseY);
        }
    });

    document.addEventListener('mouseup', () => {
        // If we drop outside a dot, cancel connection
        if (connectingState) {
            connectingState.pathEl.remove();
            connectingState = null;
        }
    });

    function getDotCenter(nodeId, dotPos) {
        const node = nodes[nodeId];
        const rect = node.el.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // Node center relative to canvas
        const centerX = (rect.left - canvasRect.left) + rect.width / 2;
        const centerY = (rect.top - canvasRect.top) + rect.height / 2;
        
        const offset = 55; // Approx half node width/height + dot offset
        
        if(dotPos === 'top') return { x: centerX, y: centerY - offset };
        if(dotPos === 'bottom') return { x: centerX, y: centerY + offset };
        if(dotPos === 'left') return { x: centerX - offset, y: centerY };
        if(dotPos === 'right') return { x: centerX + offset, y: centerY };
        
        return { x: centerX, y: centerY };
    }

    function updateConnections() {
        connections.forEach(conn => {
            const startPt = getDotCenter(conn.from, conn.fromDot);
            const endPt = getDotCenter(conn.to, conn.toDot);
            
            const pathData = getPathData(startPt.x, startPt.y, endPt.x, endPt.y);
            conn.lineEl.setAttribute('d', pathData);
            conn.hitboxEl.setAttribute('d', pathData);
            
            // Move delete UI to middle of the line
            const midX = (startPt.x + endPt.x) / 2;
            const midY = (startPt.y + endPt.y) / 2;
            conn.deleteUi.setAttribute('transform', `translate(${midX}, ${midY})`);
        });
    }

    function getPathData(x1, y1, x2, y2) {
        return `M ${x1} ${y1} Q ${(x1+x2)/2} ${y1} ${(x1+x2)/2} ${(y1+y2)/2} T ${x2} ${y2}`;
    }

    function drawPath(pathEl, x1, y1, x2, y2) {
        pathEl.setAttribute('d', getPathData(x1, y1, x2, y2));
    }

    function clearCanvas() {
        Object.values(nodes).forEach(node => {
            if (node.el && node.el.parentNode) {
                node.el.parentNode.removeChild(node.el);
            }
        });
        for (let key in nodes) delete nodes[key];
        
        connections.forEach(conn => {
            if (conn.gEl && conn.gEl.parentNode) {
                conn.gEl.parentNode.removeChild(conn.gEl);
            }
        });
        connections.length = 0;
        nodeIdCounter = 0;
    }

    // --- Window Resize ---
    window.addEventListener('resize', updateConnections);

    // --- Scenario Logic ---
    const scenarios = [
        {
            id: 0,
            verify: (counts) => {
                if (counts.loadBalancers >= 1 && counts.webServers >= 2 && counts.databases >= 1 && counts.users >= 1) return { score: 10, quote: "Perfection! High availability achieved with a load balancer and redundant web servers." };
                if (counts.loadBalancers >= 1 && counts.webServers >= 1 && counts.databases >= 1 && counts.users >= 1) return { score: 8, quote: "Great! But redundancy (multiple web servers) is crucial for true high availability." };
                if (counts.webServers >= 1 && counts.databases >= 1 && counts.users >= 1) return { score: 5, quote: "Good start. A single point of failure exists without a load balancer." };
                return { score: 0, quote: "You need at least a User, a Web Server, and a Database." };
            }
        },
        {
            id: 1,
            verify: (counts) => {
                if (counts.users >= 1 && counts.webServers >= 1 && counts.caches >= 1 && counts.databases >= 1) return { score: 10, quote: "Excellent! The cache will significantly reduce database load." };
                if (counts.users >= 1 && counts.webServers >= 1 && counts.databases >= 1) return { score: 5, quote: "Basic architecture is there, but where is the caching layer?" };
                return { score: 0, quote: "Missing core components for this scenario." };
            }
        },
        {
            id: 2,
            verify: (counts) => {
                if (counts.users >= 1 && counts.loadBalancers >= 1 && counts.webServers >= 3 && counts.databases >= 1) return { score: 10, quote: "Awesome! Scaling out horizontally allows handling massive traffic." };
                if (counts.users >= 1 && counts.loadBalancers >= 1 && counts.webServers == 2 && counts.databases >= 1) return { score: 7, quote: "Good, but you can scale out even more for higher traffic." };
                if (counts.users >= 1 && counts.webServers >= 1) return { score: 3, quote: "You need a load balancer to distribute traffic across scaled servers." };
                return { score: 0, quote: "Missing core components for this scenario." };
            }
        },
        {
            id: 3,
            verify: (counts) => {
                if (counts.users >= 1 && counts.webServers >= 1 && counts.databases >= 2) return { score: 10, quote: "Perfect! A primary-replica database setup ensures high availability at the data layer." };
                if (counts.users >= 1 && counts.webServers >= 1 && counts.databases == 1) return { score: 5, quote: "Your database is a single point of failure. Add redundancy." };
                return { score: 0, quote: "Missing core components for this scenario." };
            }
        },
        {
            id: 4,
            verify: (counts) => {
                if (counts.users >= 1 && counts.loadBalancers >= 1 && counts.webServers >= 2 && counts.caches >= 1 && counts.databases >= 2) return { score: 10, quote: "Masterpiece! A resilient, performant, and highly available production system." };
                if (counts.users >= 1 && counts.loadBalancers >= 1 && counts.webServers >= 2 && counts.databases >= 1) return { score: 8, quote: "Very close! Don't forget caching and DB redundancy for true production readiness." };
                return { score: 4, quote: "You are missing several key production components." };
            }
        }
    ];

    let currentScenarioId = 0;
    const scenarioItems = document.querySelectorAll('.scenario-item');
    const attemptedScenarios = new Set();

    scenarioItems.forEach(item => {
        item.addEventListener('click', () => {
            const scenarioId = parseInt(item.dataset.scenario);
            if (attemptedScenarios.has(scenarioId)) return; // prevent re-selecting completed
            if (attemptedScenarios.size >= 3) return; // prevent selecting if max reached

            scenarioItems.forEach(si => si.classList.remove('active'));
            item.classList.add('active');
            currentScenarioId = scenarioId;
            clearCanvas(); // clear the graph for the new scenario
        });
    });

    // --- Verification Logic ---
    const submitBtn = document.getElementById('submit-btn');
    const resultModal = document.getElementById('result-modal');
    const modalClose = document.getElementById('modal-close');
    const modalScore = document.getElementById('modal-score');
    const modalQuote = document.getElementById('modal-quote');
    const totalScoreDisplay = document.getElementById('total-score');
    let totalScore = 0;

    submitBtn.addEventListener('click', () => {
        const counts = {
            loadBalancers: 0,
            webServers: 0,
            databases: 0,
            caches: 0,
            users: 0
        };

        Object.values(nodes).forEach(node => {
            if (node.type === 'load-balancer') counts.loadBalancers++;
            if (node.type === 'web-server') counts.webServers++;
            if (node.type === 'database') counts.databases++;
            if (node.type === 'cache') counts.caches++;
            if (node.type === 'user') counts.users++;
        });

        const activeScenario = scenarios.find(s => s.id === currentScenarioId);
        if (!activeScenario) return; // safeguard

        const result = activeScenario.verify(counts);

        modalScore.innerText = result.score + "/10 Points";
        modalQuote.innerText = '"' + result.quote + '"';
        
        // Mark scenario as attempted
        if (!attemptedScenarios.has(currentScenarioId)) {
            attemptedScenarios.add(currentScenarioId);
            
            totalScore += result.score;
            totalScoreDisplay.innerText = "Score: " + totalScore;
            
            const activeItem = document.querySelector(`.scenario-item[data-scenario="${currentScenarioId}"]`);
            if (activeItem) {
                activeItem.classList.remove('active');
                activeItem.classList.add('completed');
            }

            if (attemptedScenarios.size >= 3) {
                clearInterval(timerInterval);
                modalQuote.innerText += `\n\n🎉 Congratulations Team ${currentTeamName}! You have completed your 3 allowed scenarios! Total Score: ${totalScore}/30`;
                submitBtn.disabled = true;
                submitBtn.innerText = "Challenge Completed";
                submitBtn.style.opacity = "0.5";
                submitBtn.style.cursor = "not-allowed";
                currentScenarioId = -1; // disable active state
            } else {
                // Select next available scenario automatically
                const nextItem = Array.from(scenarioItems).find(si => !attemptedScenarios.has(parseInt(si.dataset.scenario)));
                if (nextItem) {
                    nextItem.classList.add('active');
                    currentScenarioId = parseInt(nextItem.dataset.scenario);
                    clearCanvas(); // clear graph for the next scenario
                }
            }
        }

        resultModal.classList.add('active');
    });

    modalClose.addEventListener('click', () => {
        resultModal.classList.remove('active');
    });

    // --- Timer Logic ---
    let timeLeft = 900; // 15 minutes (900 seconds)
    const timerDisplay = document.getElementById('timer');
    let timerInterval;

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.style.color = '#ef4444'; // Turn red when time is up
            timerDisplay.style.borderColor = '#ef4444';
            alert(`Time is up, Team ${currentTeamName}! Please verify your design.`);
        } else {
            timeLeft--;
        }
    }
    
    function startTimer() {
        timerInterval = setInterval(updateTimer, 1000);
        updateTimer(); // Initial call
    }

    // --- Team Modal Logic ---
    let currentTeamName = "";
    const teamModal = document.getElementById('team-modal');
    const teamNameInput = document.getElementById('team-name-input');
    const startChallengeBtn = document.getElementById('start-challenge-btn');
    const teamNameDisplay = document.getElementById('team-name-display');
    const teamNameText = document.getElementById('team-name-text');

    startChallengeBtn.addEventListener('click', () => {
        const name = teamNameInput.value.trim();
        if (name.length > 0) {
            currentTeamName = name;
            teamNameText.innerText = currentTeamName;
            teamNameDisplay.style.display = 'block';
            teamModal.classList.remove('active');
            startTimer(); // Start the timer only after team registers
        } else {
            teamNameInput.style.borderColor = '#ef4444';
            teamNameInput.focus();
        }
    });

    // Handle Enter key for input
    teamNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startChallengeBtn.click();
        }
    });
});
