import Blocks from './Blocks.js';
import {
    audioPool,

} from './utils.js'

// 盒子高度（单位：方块）
export const boxHeight = 20;
// 盒子宽度为高度的一半
export const boxWidth = ~~(boxHeight / 2);
export const unit = ~~((innerHeight - innerHeight * 0.2) / boxHeight);
// 下落速度 （值越小越快）
export const speed = 500;


export const box = document.querySelector('#box');
export const infoBox = document.querySelector('#infoBox');
export const scoreBox = document.querySelector('#scoreBox');
export const root = document.querySelector('#root');
const retry = document.querySelector('#retry');
const pause = document.querySelector('#pause');

const audio = audioPool();
let blocks = new Blocks().randomCreate();
export let map = [...new Array(boxHeight)].map(it => new Array(boxWidth).fill(null));

box.style.width = `${unit * boxWidth }px`;
box.style.height = `${unit * boxHeight }px`;
box.style.border = `${unit}px solid #8BC34A`;


retry.addEventListener('click', () => {
    if (retry.innerText === 'Retry') {
        retry.innerText = 'Sure?'
    } else if (retry.innerText === 'Sure?') {
        blocks.clear();
        blocks = new Blocks().randomCreate();
        retry.innerText = 'Retry'
    }
});

retry.addEventListener('mouseleave', () => {
    retry.innerText = 'Retry'
});


pause.addEventListener('click', () => {
    if (pause.innerText === 'Pause') {
        blocks.pause();
        pause.innerText = 'Play';
    } else if (pause.innerText === 'Play') {
        blocks.play();
        pause.innerText = 'Pause';
    }
});





function playAudioBetween(startTime, durringTime) {
    const a = audio.get();
    a.src = "./music.mp3";
    a.currentTime = startTime / 1000;
    a.play();
    setTimeout(() => {
        a.close();
    }, durringTime);
}

export function playAudio(type) {
    switch (type) {
        case "fall":
            playAudioBetween(1230, 500);
            break;
        case "move":
            playAudioBetween(2175, 200);
            break;
        case "gameOver":
            playAudioBetween(3000, 5000);
            break;

    }
}
