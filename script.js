class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentTrack = null;
        this.audioContext = null;
        this.analyser = null;
        this.isVisualizerSetup = false;
        this.audioSource = null;  // 添加音频源引用
        
        // 获取DOM元素
        this.playBtn = document.querySelector('.play-btn');
        this.progressBar = document.querySelector('.progress-bar');
        this.progress = document.querySelector('.progress');
        this.currentTimeSpan = document.querySelector('.current-time');
        this.totalTimeSpan = document.querySelector('.total-time');
        this.prevBtn = document.querySelector('.icon-btn:nth-child(2)');
        this.nextBtn = document.querySelector('.icon-btn:nth-child(4)');
        this.albumCover = document.querySelector('.album-cover img');
        
        // 示例播放列表
        this.playlist = [
            {
                title: 'A Little Story',
                artist: 'Valentin',
                url: 'music/A_Little_Story-Valentin_(ヴァレンティン)-1106756-100.ogg',
                cover: 'picture/00006-926343550.png'
            }
        ];
        
        this.currentIndex = 0;
        
        // 初始化第一首歌
        this.loadTrack(0);
        
        this.initializeEvents();
    }
    
    initializeEvents() {
        // 播放/暂停按钮事件
        this.playBtn.addEventListener('click', () => this.togglePlay());
        
        // 进度条点击事件
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        
        // 音频时间更新事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        
        // 音频加载完成事件
        this.audio.addEventListener('loadedmetadata', () => this.updateTotalTime());
        
        // 上一首/下一首按钮事件
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        
        // 添加音量控制事件
        this.volumeBtn = document.querySelector('.extra-controls .icon-btn:last-child');
        this.audio.volume = 0.7; // 设置默认音量
        
        // 添加键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // 添加音频加载状态监听
        this.audio.addEventListener('loadstart', () => {
            console.log('开始加载音频');
            console.log('音频源:', this.audio.src);
        });
        
        this.audio.addEventListener('canplay', () => {
            console.log('音频可以播放');
            console.log('音频就绪状态:', this.audio.readyState);
            console.log('音频时长:', this.audio.duration);
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('音频错误:', e);
            console.error('错误详情:', this.audio.error);
            console.error('错误代码:', this.audio.error.code);
            console.error('音频状态:', this.audio.readyState);
        });
        
        // 添加音频播放状态监听
        this.audio.addEventListener('playing', () => {
            console.log('音频开始播放');
        });
        
        this.audio.addEventListener('pause', () => {
            console.log('音频已暂停');
        });
        
        this.audio.addEventListener('ended', () => {
            console.log('音频播放结束');
            this.playNext();
        });
    }
    
    togglePlay() {
        try {
            // 如果还没有加载任何音轨，先加载第一首
            if (!this.currentTrack) {
                this.loadTrack(0);
            }

            // 初始化音频上下文和可视化器
            if (!this.isVisualizerSetup) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                try {
                    this.setupVisualizer();
                } catch (error) {
                    console.error('可视化器设置失败:', error);
                }
                this.isVisualizerSetup = true;
            }
            
            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
                this.playBtn.innerHTML = '<span class="material-icons">play_circle</span>';
                this.albumCover.classList.remove('rotating');
            } else {
                // 尝试播放
                console.log('开始播放音乐:', this.currentTrack.title);
                this.audio.play()
                    .then(() => {
                        console.log('开始播放');
                        this.isPlaying = true;
                        this.playBtn.innerHTML = '<span class="material-icons">pause_circle</span>';
                        this.albumCover.classList.add('rotating');
                        // 恢复 AudioContext（如果被暂停）
                        if (this.audioContext && this.audioContext.state === 'suspended') {
                            this.audioContext.resume();
                        }
                    })
                    .catch(error => {
                        console.error('播放失败:', error);
                        console.error('当前音轨:', this.currentTrack);
                        console.error('音频状态:', this.audio.readyState);
                        alert('播放失败: ' + error.message);
                    });
            }
        } catch (error) {
            console.error('播放控制出错:', error);
            console.error('详细错误:', error.stack);
            alert('播放控制出错: ' + error.message);
        }
    }
    
    loadTrack(index) {
        try {
            this.currentTrack = this.playlist[index];
            
            // 停止当前播放
            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
            }
            
            // 重置音频元素
            this.audio.removeAttribute('src');
            this.audio.load();
            
            // 重置音频源
            if (this.audioSource) {
                this.audioSource.disconnect();
                this.audioSource = null;
            }
            
            // 设置新的音频源
            console.log('加载音轨:', this.currentTrack.title);
            console.log('音频路径:', this.currentTrack.url);
            this.audio.src = this.currentTrack.url;
            this.albumCover.src = this.currentTrack.cover;
            this.currentIndex = index;
            
            // 预加载音频
            this.audio.load();
            
            // 监听加载完成事件
            this.audio.addEventListener('loadeddata', () => {
                console.log('音频数据已加载');
            }, { once: true });
            
            this.audio.addEventListener('canplaythrough', () => {
                console.log('音频可以流畅播放');
            }, { once: true });
            
            // 监听错误
            this.audio.addEventListener('error', (e) => {
                console.error('音频加载错误:', e);
                console.error('错误代码:', this.audio.error.code);
            }, { once: true });
            
            document.title = `${this.currentTrack.title} - ${this.currentTrack.artist}`;
        } catch (error) {
            console.error('加载音轨出错:', error);
            console.error('详细错误:', error.stack);
            alert('加载音轨出错: ' + error.message);
        }
    }
    
    updateProgress() {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        const progressPercent = (currentTime / duration) * 100;
        this.progress.style.width = `${progressPercent}%`;
        this.currentTimeSpan.textContent = this.formatTime(currentTime);
    }
    
    seek(event) {
        const progressBarWidth = this.progressBar.clientWidth;
        const clickPosition = event.offsetX;
        const duration = this.audio.duration;
        this.audio.currentTime = (clickPosition / progressBarWidth) * duration;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateTotalTime() {
        this.totalTimeSpan.textContent = this.formatTime(this.audio.duration);
    }
    
    playPrevious() {
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(this.currentIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }
    
    playNext() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadTrack(this.currentIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }
    
    toggleMute() {
        if (this.audio.muted) {
            this.audio.muted = false;
            this.volumeBtn.innerHTML = '<span class="material-icons">volume_up</span>';
        } else {
            this.audio.muted = true;
            this.volumeBtn.innerHTML = '<span class="material-icons">volume_off</span>';
        }
    }
    
    handleKeyboard(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                this.audio.currentTime -= 5;
                break;
            case 'ArrowRight':
                this.audio.currentTime += 5;
                break;
            case 'ArrowUp':
                this.audio.volume = Math.min(1, this.audio.volume + 0.1);
                break;
            case 'ArrowDown':
                this.audio.volume = Math.max(0, this.audio.volume - 0.1);
                break;
        }
    }
    
    async setupVisualizer() {
        try {
            // 如果已经设置过，先清理旧的连接
            if (this.audioSource) {
                this.audioSource.disconnect();
            }
            
            this.analyser = this.audioContext.createAnalyser();
            this.audioSource = this.audioContext.createMediaElementSource(this.audio);
            
            this.audioSource.connect(this.analyser);
            // 确保音频可以输出到扬声器
            this.analyser.connect(this.audioContext.destination);
            
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const canvas = document.getElementById('visualizer');
            const ctx = canvas.getContext('2d');
            
            const draw = () => {
                if (!this.isPlaying) return;  // 如果没有播放就不更新可视化
                requestAnimationFrame(draw);
                this.analyser.getByteFrequencyData(dataArray);
                
                ctx.fillStyle = 'rgb(26, 30, 45)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;
                
                for(let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i] * 0.7;
                    ctx.fillStyle = `rgb(139, 92, 246)`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            };
            
            draw();
        } catch (error) {
            console.error('设置可视化器时出错:', error);
            console.error('详细错误:', error.message);
            throw error;
        }
    }
}

// 初始化播放器
document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
}); 