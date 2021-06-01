/**
 * audio 池， 减少创建和销毁audio的开销
 */
export function audioPool({
    count = 20
} = {}) {
    const audios = [];
    let endedAudios = [];

    const createAudio = () => {
        const audio = new Audio();
        audio.preload = "auto";
        audio.close = () => {
            audio.pause();
            audio.currentTime = 0;
            endedAudios.push(audio);
        }
        audios.push(audio);
        endedAudios.push(audio);
        return audio;
    }

    // To create 20 audios
    for (let i = 0; i < count; i++) {
        createAudio();
    }
    const get = () => {
        if (endedAudios.length === 0) {
            createAudio();
        }
        return endedAudios.pop();
    }

    return {
        get
    }
}

/**
 * 抖动元素：改变元素的 translate
 */
export function shake(element) {
    element.style.transform = `translate(5px, 5px)`
    setTimeout(() => {
        element.style.transform = `translate(0px, 0px)`
    }, 50)
}