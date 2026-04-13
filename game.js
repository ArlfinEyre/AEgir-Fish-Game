const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const assets = {
    bg: new Image(),
    player: new Image(),
    reward: new Image(),
    punish: new Image(),
    enemy: new Image()
};

assets.bg.src = 'assets/bg.jpg';
assets.player.src = 'assets/player.png';
assets.reward.src = 'assets/special_reward.png';
assets.punish.src = 'assets/special_punish.png';

// 添加鱼的种类，大小和速度
assets.fishVariants = [
    { 
        url: 'assets/jellyfish.png',     
        minSize: 30, maxSize: 60,
        minSpeed: 2, maxSpeed: 4,
        weight: 40
    },
    { 
        url: 'assets/fish_specter.png', 
        minSize: 40, maxSize: 80,
        minSpeed: 3, maxSpeed: 5,
        weight: 25
    },
    { 
        url: 'assets/fish_skadi.png',   
        minSize: 50, maxSize: 100,
        minSpeed: 3, maxSpeed: 5,
        weight: 20
    },
    { 
        url: 'assets/fish_gld.png',   
        minSize: 70, maxSize: 130,
        minSpeed: 4, maxSpeed: 7,
        weight: 10
    },
    { 
        url: 'assets/fish_ulp.png',     
        minSize: 180, maxSize: 300,
        minSpeed: 1, maxSpeed: 2,
        weight: 5
    },
];

assets.fishVariants.forEach(variant => {
    variant.img = new Image();
    variant.img.src = variant.url;
});

// 核心状态初始化
let isGameOver = false;
let score = 0;
let hp = 5;
let entities = [];
let keys = {};

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
window.addEventListener('keydown', e => {
    if (e.code === 'Space' && isGameOver) startGame();
});

function getRandomFishVariant() {
    let totalWeight = assets.fishVariants.reduce((sum, variant) => sum + variant.weight, 0);
    
    let randomNum = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (let variant of assets.fishVariants) {
        currentWeight += variant.weight;
        if (randomNum <= currentWeight) {
            return variant;
        }
    }
    return assets.fishVariants[0];
}

class Player {
    constructor() {
        this.x = 1920 / 2;
        this.y = 1080 / 2;
        this.width = 100;
        this.ratio = 1;
        if (assets.player.complete && assets.player.naturalWidth !== 0) {
            this.ratio = assets.player.naturalHeight / assets.player.naturalWidth;
        }

        this.height = this.width * this.ratio;

        this.targetWidth = this.width; 

        this.speed = 6;
        this.invincibleTimer = 0;         
    }

    update() {
        if (keys['w'] || keys['arrowup']) this.y -= this.speed;
        if (keys['s'] || keys['arrowdown']) this.y += this.speed;
        if (keys['a'] || keys['arrowleft']) this.x -= this.speed;
        if (keys['d'] || keys['arrowright']) this.x += this.speed;

        this.x = Math.max(0, Math.min(1920 - this.width, this.x));
        this.y = Math.max(0, Math.min(1080 - this.height, this.y));

        this.width += (this.targetWidth - this.width) * 0.05;
        
        this.height = this.width * this.ratio;

        if (this.invincibleTimer > 0) this.invincibleTimer--;
    }

    draw() {
        if (this.invincibleTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) return;

        if (assets.player.complete && assets.player.naturalWidth !== 0) {
            ctx.drawImage(assets.player, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // ctx.strokeStyle = '#00FF00';
        // ctx.lineWidth = 2;           
        // ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    takeDamage() {
        if (this.invincibleTimer <= 0) {
            hp--;
            this.invincibleTimer = 120; 
            if (hp <= 0) endGame();
        }
    }
}

class Entity {
    constructor(type) {
        this.type = type;
        
        if (Math.random() > 0.5) {
            this.x = Math.random() > 0.5 ? -200 : 2120;
            this.y = Math.random() * 1080;
        } else {
            this.x = Math.random() * 1920;
            this.y = Math.random() > 0.5 ? -200 : 1280;
        }

        if (type === 'fish') {
            const variant = getRandomFishVariant();
            this.img = variant.img;
            
            let randomWidth = Math.random() * (variant.maxSize - variant.minSize) + variant.minSize;
            
            this.speed = Math.random() * (variant.maxSpeed - variant.minSpeed) + variant.minSpeed;
            
            if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
                let ratio = this.img.naturalHeight / this.img.naturalWidth;
                this.width = randomWidth;
                this.height = randomWidth * ratio;
            } else {
                this.width = randomWidth;
                this.height = randomWidth;
            }
        } else if (type === 'reward') {
            this.img = assets.reward;
            // 更改奖励大小和速度
            this.width = 80;
            this.height = 80;
            this.speed = 2;
            
        } else if (type === 'punish') {
            this.img = assets.punish;
            // 更改惩罚大小和速度
            this.width = 80;
            this.height = 80;
            this.speed = 2;
        }

        let angle = Math.atan2((1080/2 - 200 + Math.random()*400) - this.y, (1920/2 - 200 + Math.random()*400) - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        let img = this.img;
        let color = this.type === 'fish' ? '#F44336' : (this.type === 'reward' ? '#FFEB3B' : '#9C27B0');

        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // ctx.strokeStyle = '#00FF00'; // 玩家用醒目的荧光绿边框
        // ctx.lineWidth = 2;           // 边框粗细
        // ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return (this.x < -200 || this.x > 2120 || this.y < -200 || this.y > 1280);
    }
}

let player;
let spawnTimer = 0;

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 核心状态更新
function startGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    player = new Player();
    entities = [];
    score = 0;
    hp = 5;
    isGameOver = false;
    gameLoop();
}

function endGame() {
    isGameOver = true;
    document.getElementById('game-over-screen').style.display = 'flex';
    document.getElementById('final-score').innerText = score;
    saveAndShowLeaderboard();
}

function saveAndShowLeaderboard() {
    let board = JSON.parse(localStorage.getItem('fishGameScores')) || [];
    board.push(score);
    board.sort((a, b) => b - a); // 降序排列
    board = board.slice(0, 5);   // 只保留前5名
    localStorage.setItem('fishGameScores', JSON.stringify(board));

    const listUl = document.getElementById('leaderboard-list');
    listUl.innerHTML = '';
    board.forEach((s, index) => {
        listUl.innerHTML += `<li>第 ${index + 1} 名: ${s} 分</li>`;
    });
}

function gameLoop() {
    if (isGameOver) return;

    if (assets.bg.complete && assets.bg.naturalWidth !== 0) {
        ctx.drawImage(assets.bg, 0, 0, 1920, 1080);
    } else {
        ctx.fillStyle = '#0a4263';
        ctx.fillRect(0, 0, 1920, 1080);
    }

    // 随机生成实体的时间
    spawnTimer++;
    if (spawnTimer % 50 === 0) entities.push(new Entity('fish'));
    if (spawnTimer % 800 === 0) entities.push(new Entity('reward'));
    if (spawnTimer % 900 === 0) entities.push(new Entity('punish'));

    player.update();
    player.draw();

    for (let i = entities.length - 1; i >= 0; i--) {
        let e = entities[i];
        e.update();
        e.draw();

        if (checkCollision(player, e)) {
            let playerArea = player.width * player.height;
            let entityArea = e.width * e.height;

            if (e.type === 'fish') {
                if (playerArea > entityArea) {
                    score += 10; // 吃鱼数值
                    let eatenArea = e.width * e.height;
                    let growthFactor = Math.sqrt(eatenArea) * 0.1;
                    player.targetWidth += growthFactor;
                    entities.splice(i, 1);
                } else {
                    player.takeDamage();
                }
            } else if (e.type === 'reward') {
                score += 50; // 特殊奖励数值
                entities.splice(i, 1);
            } else if (e.type === 'punish') {
                score -= 30; // 特殊惩罚数值
                player.takeDamage(); // 附带扣血
                entities.splice(i, 1);
            }
        } else if (e.isOffScreen()) {
            entities.splice(i, 1);
        }
    }

    document.getElementById('score-display').innerText = score;
    document.getElementById('hp-display').innerText = hp;

    requestAnimationFrame(gameLoop);
}

startGame();