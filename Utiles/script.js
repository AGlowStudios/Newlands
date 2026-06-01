// ==========================================
// SISTEMA DE PARTÍCULAS (Fondo)
// ==========================================
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particlesCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        const count = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        for (let i = 0; i < count; i++) this.particles.push(this.createParticle());
    }
    
    createParticle() {
        const colors = ['#00f3ff', '#ff00ff', '#9d00ff', '#0066ff'];
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.5 + 0.2
        };
    }
    
    update() {
        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fill();
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        this.ctx.globalAlpha = 1;
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// ==========================================
// SISTEMA DE MONITOREO REAL (Red, CPU, Radar)
// ==========================================
class SystemMonitor {
    constructor() {
        // Elementos Loading Screen
        this.signalBars = document.querySelectorAll('#signalBars .bar');
        this.netSpeedText = document.getElementById('networkSpeed');
        this.radarBlip = document.getElementById('radarBlip');
        this.cpuBar = document.getElementById('cpuBar');
        this.cpuText = document.getElementById('cpuText');

        // Elementos Menu Screen
        this.menuSignalBars = document.querySelectorAll('#menuSignalBars .bar');
        this.menuNetSpeedText = document.getElementById('menuNetworkSpeed');
        this.menuRadarBlip = document.getElementById('menuRadarBlip');
        this.menuCpuBar = document.getElementById('menuCpuBar');
        this.menuCpuText = document.getElementById('menuCpuText');
        this.connStatus = document.getElementById('connectionStatus');
        this.clockDisplay = document.getElementById('clockDisplay');

        // Conexión API
        this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        this.init();
    }

    init() {
        // 1. Monitor de Red
        this.updateNetworkStatus();
        if (this.connection) {
            this.connection.addEventListener('change', () => this.updateNetworkStatus());
        }
        window.addEventListener('online', () => this.updateNetworkStatus());
        window.addEventListener('offline', () => this.updateNetworkStatus());

        // 2. Radar Tracker (Mouse)
        document.addEventListener('mousemove', (e) => this.updateRadar(e));

        // 3. CPU / System Load (Simulado basado en rendimiento)
        setInterval(() => this.updateCPULoad(), 1000);

        // 4. Reloj
        setInterval(() => this.updateClock(), 1000);
    }

    updateNetworkStatus() {
        let bars = 0;
        let speedText = "OFFLINE";
        let isOnline = navigator.onLine;

        if (isOnline && this.connection) {
            // Downlink es una estimación en Mbps
            const mbps = this.connection.downlink;
            speedText = `${mbps} Mbps`;
            
            if (mbps > 10) bars = 4;
            else if (mbps > 5) bars = 3;
            else if (mbps > 1) bars = 2;
            else bars = 1;
        } else if (isOnline) {
            speedText = "ONLINE";
            bars = 2; // Default si no hay API
        } else {
            speedText = "NO SIGNAL";
            bars = 0;
        }

        // Actualizar UI Loading
        this.netSpeedText.textContent = speedText;
        this.signalBars.forEach((bar, index) => {
            bar.classList.toggle('active', index < bars);
        });

        // Actualizar UI Menu
        this.menuNetSpeedText.textContent = speedText;
        this.menuSignalBars.forEach((bar, index) => {
            bar.classList.toggle('active', index < bars);
        });

        // Actualizar Texto de Estado Global
        if (this.connStatus) {
            if (isOnline) {
                this.connStatus.textContent = "EN LÍNEA";
                this.connStatus.className = "info-value online";
            } else {
                this.connStatus.textContent = "SIN CONEXIÓN";
                this.connStatus.className = "info-value offline";
            }
        }
    }

    updateRadar(e) {
        // Mapear posición del mouse (0 a window.innerWidth) al grid (0% a 100%)
        const xPercent = (e.clientX / window.innerWidth) * 100;
        const yPercent = (e.clientY / window.innerHeight) * 100;

        // Actualizar blips
        if(this.radarBlip) {
            this.radarBlip.style.left = `${xPercent}%`;
            this.radarBlip.style.top = `${yPercent}%`;
        }
        if(this.menuRadarBlip) {
            this.menuRadarBlip.style.left = `${xPercent}%`;
            this.menuRadarBlip.style.top = `${yPercent}%`;
        }
    }

    updateCPULoad() {
        // Simulación de carga del sistema
        // Base load aleatoria entre 10% y 30%
        let load = Math.floor(Math.random() * 20) + 10;

        // Si la ventana está activa y hay movimiento, sube un poco
        if (document.hasFocus()) load += 15;

        // Color coding
        let color = 'var(--neon-green)';
        if (load > 60) color = 'var(--neon-cyan)';
        if (load > 85) color = 'var(--neon-red)';

        // Update Loading Screen
        if (this.cpuBar) {
            this.cpuBar.style.width = `${load}%`;
            this.cpuBar.style.background = color;
            this.cpuBar.style.boxShadow = `0 0 10px ${color}`;
            this.cpuText.textContent = `${load}%`;
        }

        // Update Menu Screen
        if (this.menuCpuBar) {
            this.menuCpuBar.style.width = `${load}%`;
            this.menuCpuBar.style.background = color;
            this.menuCpuBar.style.boxShadow = `0 0 10px ${color}`;
            this.menuCpuText.textContent = `${load}%`;
        }
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { hour12: false });
        if (this.clockDisplay) this.clockDisplay.textContent = timeString;
    }
}

// ==========================================
// LÓGICA DE CARGA Y TRANSICIÓN
// ==========================================
class LoadingSystem {
    constructor() {
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.compileText = document.getElementById('compileText');
        this.memoryText = document.getElementById('memoryText');
        this.statusText = document.getElementById('statusText');
        
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.maxMemory = 256;
        this.currentMemory = 0;
        
        this.statusMessages = [
            'Inicializando núcleo...',
            'Cargando módulos de red...',
            'Sincronizando datos...',
            'Optimizando renderizado...',
            'Verificando integridad...',
            'Preparando interfaz...',
            'Sistema listo'
        ];
        
        this.init();
    }
    
    init() {
        new ParticleSystem();
        new SystemMonitor(); // Iniciar monitores funcionales
        setTimeout(() => this.simulateLoading(), 500);
    }
    
    simulateLoading() {
        const interval = setInterval(() => {
            const jump = Math.random() * 12 + 3;
            this.targetProgress = Math.min(this.targetProgress + jump, 100);
            this.currentMemory = Math.min(this.currentMemory + (this.maxMemory * jump / 100) + Math.random() * 10, this.maxMemory);
            
            this.animateProgress(this.currentProgress, this.targetProgress);
            this.memoryText.textContent = `${Math.floor(this.currentMemory)}/${this.maxMemory}MB`;
            
            const msgIndex = Math.floor((this.currentProgress / 100) * (this.statusMessages.length - 1));
            this.statusText.textContent = this.statusMessages[msgIndex];
            this.compileText.textContent = `Procesando... ${Math.floor(this.currentProgress)}%`;
            
            this.currentProgress = this.targetProgress;
            
            if (this.currentProgress >= 100) {
                clearInterval(interval);
                setTimeout(() => this.completeLoading(), 500);
            }
        }, 350);
    }
    
    animateProgress(start, end) {
        const duration = 300;
        const startTime = performance.now();
        
        const step = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = start + (end - start) * eased;
            
            this.progressBar.style.width = `${val}%`;
            this.progressText.textContent = `${Math.floor(val)}%`;
            
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }
    
    completeLoading() {
        this.progressBar.style.boxShadow = '0 0 50px rgba(0, 243, 255, 0.8)';
        this.progressText.textContent = 'LISTO';
        setTimeout(() => this.transitionToMenu(), 800);
    }
    
    transitionToMenu() {
        const loading = document.getElementById('loadingScreen');
        const menu = document.getElementById('startScreen');
        
        loading.style.opacity = '0';
        
        setTimeout(() => {
            loading.classList.remove('active');
            menu.classList.add('active');
            setTimeout(() => { menu.style.opacity = '1'; }, 50);
            this.initMenuButtons();
        }, 800);
    }
    
    initMenuButtons() {
        const buttons = document.querySelectorAll('.menu-btn');
        buttons.forEach((btn, i) => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateX(-30px)';
            setTimeout(() => {
                btn.style.transition = 'all 0.5s ease';
                btn.style.opacity = '1';
                btn.style.transform = 'translateX(0)';
            }, i * 150);
            
            btn.addEventListener('click', () => {
                alert(`Acción ejecutada: ${btn.dataset.action.toUpperCase()}`);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new LoadingSystem());