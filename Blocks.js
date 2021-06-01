import {
    unit,
    box,
    boxWidth,
    boxHeight,
    map,
    speed,
    scoreBox,
    playAudio,
    root
} from './main.js';
import {
    randomShape
} from './Shapes.js';
import {
    shake,
} from './utils.js'

const scoreDom = document.querySelector('#score');
const nextShapeDom = document.querySelector('#nextShape');

let score = 0;
let nextShape = randomShape();
let currentBlocks;

export default class Blocks {

    color;
    block = [];
    centerBlock;
    timer;
    paused;
    preViewBlock = [];


    constructor(color, shape) {
        if (!color || !shape) {
            return this;
        }
        const shapeObj = this.parseShape({
            color,
            shape
        });
        this.block = shapeObj.block;
        this.centerBlock = shapeObj.centerBlock;
        let centerX = ~~(boxWidth / 2) - ~~((Math.max(...this.block.map(it => it.x)) + 1) / 2);
        this.block.forEach(it => it.x += centerX);
        this.color = color;
        currentBlocks = this;
    }

    parseShape({
        color,
        shape
    }) {
        const s = shape.replace(/^\n*/g, '');
        let y = 0;
        let x = 0;
        const block = [];
        let centerBlock = [];
        [...s].forEach((it, index) => {
            if (it === '#' || it === '@') {
                block.push(new Block(x++, y, color, index));
            } else if (it === '\n') {
                y++;
                x = 0;
            } else {
                x++;
            }
            if (x > boxWidth || y > boxHeight) {
                throw "the size of box overflow."
            }
            if (it === '@') {
                centerBlock = block[block.length - 1];
            }
        });
        return {
            block,
            centerBlock
        };
    }

    keyDownHandler = (e) => {
        switch (e.code) {
            case 'ArrowRight':
                this.right();
                playAudio("move");
                break;
            case 'ArrowLeft':
                this.left();
                playAudio("move");
                break;
            case 'ArrowDown':
                this.down();
                playAudio("move");
                break;
            case 'ArrowUp':
                this.rotate();
                playAudio("move");
                break;
            case 'Space':
                this.fall();
                playAudio("fall");
                setTimeout(() => {
                    shake(root);
                }, 20);
                break;
        }
    }

    create() {
        this.block.forEach(it => it.create());
        window.addEventListener('keydown', this.keyDownHandler)
        this.timer = setInterval(() => {
            if (this.paused) {
                return;
            }
            this.down();
        }, speed);
        return this;
    }

    isGameOver() {
        return this.block.find(it => it.y <= 0);
    }

    left() {
        if (this.block.find(it => it.x <= 0 || map[it.y][it.x - 1] !== null)) {
            return false;
        }
        this.block.forEach(it => it.x--);
        this.render();
        return true;
    }

    right() {
        if (this.block.find(it => it.x >= boxWidth - 1 || map[it.y][it.x + 1] !== null)) {
            return false;
        }
        this.block.forEach(it => it.x++);
        this.render();
        return true;
    }

    down() {
        // blocks fixed
        if (this.block.find(it => it.y >= boxHeight - 1 || map[it.y + 1][it.x] !== null)) {
            this.block.forEach(it => {
                map[it.y][it.x] = it;
            })
            this.onBottom();
            return false;
        }
        this.block.forEach(it => it.y++);
        this.render();
        return true;
    }

    fall() {
        while (this.down());
    }


    rotate() {
        if (this.centerBlock.length === 0) {
            return false;
        }
        const {
            x: x2,
            y: y2
        } = this.centerBlock;
        const θ = Math.PI / 2;
        let rotateBlock = [];
        this.block.forEach(it => {
            const {
                x: x1,
                y: y1
            } = it;
            const x = Math.round((x1 - x2) * Math.cos(θ) - (y1 - y2) * Math.sin(θ) + x2);
            const y = Math.round((x1 - x2) * Math.sin(θ) + (y1 - y2) * Math.cos(θ) + y2);
            rotateBlock.push([x, y]);
        })
        const minY = Math.min(...rotateBlock.map(it => it[1]));
        const minX = Math.min(...rotateBlock.map(it => it[0]));
        const maxY = Math.max(...rotateBlock.map(it => it[1]));
        const maxX = Math.max(...rotateBlock.map(it => it[0]));
        if (minX < 0 || maxX >= boxWidth || minY < 0 || maxY >= boxHeight) {
            return false;
        }
        this.block.forEach((it, i) => {
            const [x, y] = rotateBlock[i];
            if (x < 0) {
                this.left();
            } else if (x >= boxWidth) {
                this.right();
            }
            it.x = x;
            it.y = y;
        });
        this.render();
        return true;
    }

    render() {
        this.block.forEach(it => it.render());
        this.preView();
        scoreDom.innerText = score;
    }

    preView() {
        if (this.block.length === 0) {
            return;
        }
        const preBlock = this.block.map(it => ({
            x: it.x,
            y: it.y
        }));
        while (true) {
            if (preBlock.find(it => it.y >= boxHeight - 1 || map[it.y + 1][it.x] !== null)) {
                break;
            }
            preBlock.forEach(it => it.y++);
        }
        if (this.preViewBlock.length === 0) {
            this.preViewBlock = preBlock.map(it => new Block(it.x, it.y, this.color).create());
            this.preViewBlock.forEach(it => {
                it.element.style.opacity = '0.2';
                it.render();
            });
        } else {
            this.preViewBlock.forEach((it, i) => {
                it.element.style.transform = `translate(${preBlock[i].x * unit}px, ${preBlock[i].y * unit}px)`;
            })
        }
    }

    randomCreate() {
        const {
            color,
            shape
        } = nextShape;

        nextShape = randomShape();
        nextShapeDom.innerHTML = '';
        this.parseShape(nextShape).block.forEach(it => it.create(nextShapeDom));
        new Blocks(color, shape).create();
        return this;
    }

    // invoke when the blocks slide to the bottom
    onBottom() {
        clearInterval(this.timer);
        window.removeEventListener('keydown', this.keyDownHandler);
        this.preViewBlock.forEach(it => it.element.remove());
        this.preViewBlock = [];
        let scoreK = 1;
        // clear when one row is full.
        for (let k = map.length - 1; k >= 0;) {
            const it = map[k];
            if (it.findIndex(j => j === null) != -1) {
                k--;
                continue;
            }
            addScore(scoreK++ * 100, '#4CAF50', 30);
            it.forEach(j => {
                j.element.style.backgroundColor = 'rgb(139 195 74)';
                j.element.style.opacity = '0';
                setTimeout(() => {
                    j.element.remove();
                }, 500);
            });
            for (let i = k; i > 0; i--) {
                map[i] = map[i - 1];
                map[i].forEach(it => {
                    if (it) {
                        it.y++;
                        setTimeout(() => {
                            it.render();
                        }, 200);
                    }
                });
            }
            map[0] = new Array(boxWidth).fill(null);
        }
        if (this.isGameOver()) {
            console.info("game over");
            playAudio('gameOver');
            return;
        }
        addScore(this.block.length);
        this.randomCreate();
    }

    clear() {
        console.info('clear')
        clearInterval(currentBlocks.timer);
        window.removeEventListener('keydown', currentBlocks.keyDownHandler);
        currentBlocks.block.forEach(it => {
            it.element.remove();
        });
        currentBlocks = [];
        box.innerHTML = '';
        map.forEach(it => it.fill(null));
        score = 0;
        this.render();
    }

    pause() {
        currentBlocks.paused = true;
        window.removeEventListener('keydown', currentBlocks.keyDownHandler);
    }

    play() {
        currentBlocks.paused = false;
        window.addEventListener('keydown', currentBlocks.keyDownHandler);
    }



}

/**
 * 每一个小方块
 */
export class Block {
    x;
    y;
    color;
    element;
    text;

    constructor(x, y, color, text = '') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.text = text;
    }

    create(parent) {
        parent = parent || box;
        const div = document.createElement('div');
        div.setAttribute('class', 'block');
        div.style.backgroundColor = this.color;
        div.style.width = `${unit}px`;
        div.style.height = `${unit}px`;
        div.style.transform = `translate(${this.x * unit}px, ${this.y * unit}px)`
        // div.innerText = this.text;
        parent.appendChild(div)
        this.element = div;
        return this;
    }

    render() {
        this.element.style.backgroundColor = this.color;
        this.element.style.transform = `translate(${this.x * unit}px, ${this.y * unit}px)`
    }

}

/**
 * 增加分数，并显示过渡动画
 * @param {*} value 增加的值
 * @param {*} color 动画颜色
 * @param {*} size 动画字体大小
 */
function addScore(value, color, size) {
    score += value;
    const div = document.createElement('div');
    div.setAttribute('class', 'addScore');
    div.style.color = color;
    div.style.transform = `translate(${0}px, ${0}px)`;
    div.innerText = `+${value}`;
    div.style.fontSize = size || 'inherit';
    scoreBox.appendChild(div);
    setTimeout(() => {
        div.style.transform = `translate(${0}px, ${-10}px)`;
        div.style.opacity = '0';
    }, 20);
    setTimeout(() => {
        div.remove();
    }, 1020);
}