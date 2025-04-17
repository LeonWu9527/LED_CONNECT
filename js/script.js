// Arduino LED 控制腳本
let port;
let reader;
let writer;
let readLoopRunning = false;

// DOM 元素
let connectButton, disconnectButton, brightnessSlider, brightnessValue, blinkRateSlider, blinkRateValue, connectionStatus;

// 在文件完全載入後初始化DOM元素
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM已完全載入，正在初始化元素');
    
    // 獲取DOM元素
    connectButton = document.getElementById('connect-button');
    disconnectButton = document.getElementById('disconnect-button');
    brightnessSlider = document.getElementById('brightness-slider');
    brightnessValue = document.getElementById('brightness-value');
    blinkRateSlider = document.getElementById('blink-rate-slider');
    blinkRateValue = document.getElementById('blink-rate-value');
    connectionStatus = document.getElementById('connection-status');
    
    // 檢查是否成功獲取所有元素
    if (!connectButton || !disconnectButton || !brightnessSlider || 
        !brightnessValue || !blinkRateSlider || !blinkRateValue || !connectionStatus) {
        console.error('無法找到一個或多個重要DOM元素：', {
            connectButton: !!connectButton,
            disconnectButton: !!disconnectButton,
            brightnessSlider: !!brightnessSlider,
            brightnessValue: !!brightnessValue,
            blinkRateSlider: !!blinkRateSlider,
            blinkRateValue: !!blinkRateValue,
            connectionStatus: !!connectionStatus
        });
        return;
    }
    
    console.log('所有DOM元素已成功初始化');
    
    // 添加事件監聽器
    connectButton.addEventListener('click', function(e) {
        console.log('連接按鈕被點擊');
        connectToArduino();
    });
    
    disconnectButton.addEventListener('click', disconnectFromArduino);
    brightnessSlider.addEventListener('input', updateBrightness);
    blinkRateSlider.addEventListener('input', updateBlinkRate);
    
    // 檢查 Web Serial API 是否可用
    if (!('serial' in navigator)) {
        connectionStatus.textContent = '此瀏覽器不支援 Web Serial API，請使用 Chrome 或 Edge 瀏覽器';
        connectButton.disabled = true;
    } else {
        console.log('Web Serial API 可用');
    }
});

// 連接到 Arduino
async function connectToArduino() {
    try {
        console.log("嘗試連接到 Arduino...");
        connectionStatus.textContent = '正在連接...';
        
        // 檢查 Web Serial API 是否可用
        if (!navigator.serial) {
            throw new Error("此瀏覽器不支援 Web Serial API，請使用 Chrome 或 Edge 瀏覽器");
        }
        
        // 確保之前的連接已關閉
        if (port) {
            try {
                await disconnectFromArduino();
            } catch (e) {
                console.warn("關閉先前連接時出現警告:", e);
            }
        }
        
        // 請求串口並打開連接
        port = await navigator.serial.requestPort().catch(error => {
            console.error("選擇串口失敗:", error);
            throw new Error("用戶取消了串口選擇或選擇串口失敗");
        });
        
        console.log("已選擇串口，正在嘗試打開...");
        
        await port.open({ baudRate: 9600 }).catch(error => {
            console.error("打開串口失敗:", error);
            throw new Error("無法打開所選串口，請確認該設備是否已連接且未被其他程式佔用");
        });
        
        console.log("串口已成功打開!");
        
        // 設置讀寫器
        try {
            writer = port.writable.getWriter();
            reader = port.readable.getReader();
        } catch (error) {
            console.error("設置讀寫器失敗:", error);
            if (port.readable) {
                await port.close().catch(e => console.warn("關閉串口時出現警告:", e));
            }
            throw new Error("無法建立與 Arduino 的通訊");
        }
        
        // 更新UI狀態
        connectButton.disabled = true;
        disconnectButton.disabled = false;
        brightnessSlider.disabled = false;
        blinkRateSlider.disabled = false;
        connectionStatus.textContent = '已連接';
        connectionStatus.classList.add('connected');
        connectionStatus.classList.remove('disconnected');
        
        // 在連接狀態文字前添加狀態指示器
        if (!document.querySelector('.status-indicator')) {
            const statusIndicator = document.createElement('span');
            statusIndicator.className = 'status-indicator connected';
            connectionStatus.prepend(statusIndicator);
        } else {
            document.querySelector('.status-indicator').classList.add('connected');
            document.querySelector('.status-indicator').classList.remove('disconnected');
        }
        
        // 開始讀取循環
        if (!readLoopRunning) {
            readLoop();
        }
    } catch (error) {
        console.error('連接錯誤:', error);
        connectionStatus.textContent = `連接失敗: ${error.message}`;
        connectionStatus.classList.add('disconnected');
        connectionStatus.classList.remove('connected');
        
        // 確保資源釋放
        if (writer) {
            try {
                await writer.close();
                writer = null;
            } catch (e) {
                console.warn("關閉writer時出現警告:", e);
            }
        }
        
        if (reader) {
            try {
                await reader.cancel();
                reader = null;
            } catch (e) {
                console.warn("取消reader時出現警告:", e);
            }
        }
        
        if (port && port.readable) {
            try {
                await port.close();
                port = null;
            } catch (e) {
                console.warn("關閉串口時出現警告:", e);
            }
        }
        
        // 在連接狀態文字前添加狀態指示器
        if (!document.querySelector('.status-indicator')) {
            const statusIndicator = document.createElement('span');
            statusIndicator.className = 'status-indicator disconnected';
            connectionStatus.prepend(statusIndicator);
        } else {
            document.querySelector('.status-indicator').classList.add('disconnected');
            document.querySelector('.status-indicator').classList.remove('connected');
        }
    }
}

// 從 Arduino 讀取數據
async function readLoop() {
    if (readLoopRunning) return;
    readLoopRunning = true;
    
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }
            // 處理從 Arduino 讀取的數據
            console.log('從 Arduino 收到:', new TextDecoder().decode(value));
        }
    } catch (error) {
        console.error('讀取錯誤:', error);
    } finally {
        readLoopRunning = false;
        reader.releaseLock();
    }
}

// 斷開與 Arduino 的連接
async function disconnectFromArduino() {
    if (reader) {
        await reader.cancel();
    }
    
    if (writer) {
        await writer.close();
        writer = null;
    }
    
    if (port) {
        await port.close();
        port = null;
    }
    
    // 更新UI狀態
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    brightnessSlider.disabled = true;
    blinkRateSlider.disabled = true;
    connectionStatus.textContent = '已斷開連接';
    connectionStatus.classList.remove('connected');
    connectionStatus.classList.add('disconnected');
    
    // 更新狀態指示器
    if (document.querySelector('.status-indicator')) {
        document.querySelector('.status-indicator').classList.remove('connected');
        document.querySelector('.status-indicator').classList.add('disconnected');
    }
    
    readLoopRunning = false;
}

// 更新 LED 亮度
async function updateBrightness() {
    if (!writer) return;
    
    const value = brightnessSlider.value;
    brightnessValue.textContent = value;
    
    try {
        // 發送亮度值到 Arduino
        // 使用格式 "L:數值" 其中數值為 0-255
        const command = `L:${value}\n`;
        await writer.write(new TextEncoder().encode(command));
    } catch (error) {
        console.error('發送亮度錯誤:', error);
        connectionStatus.textContent = `發送錯誤: ${error.message}`;
        connectionStatus.classList.remove('connected');
        connectionStatus.classList.add('disconnected');
    }
}

// 更新 LED 閃爍頻率
async function updateBlinkRate() {
    if (!writer) return;
    
    const value = blinkRateSlider.value;
    blinkRateValue.textContent = value;
    
    try {
        // 發送閃爍頻率值到 Arduino
        // 使用格式 "B:數值" 其中數值為 0-10，0表示不閃爍
        const command = `B:${value}\n`;
        await writer.write(new TextEncoder().encode(command));
    } catch (error) {
        console.error('發送閃爍頻率錯誤:', error);
        connectionStatus.textContent = `發送錯誤: ${error.message}`;
        connectionStatus.classList.remove('connected');
        connectionStatus.classList.add('disconnected');
    }
}

// 檢查 Web Serial API 是否可用
document.addEventListener('DOMContentLoaded', () => {
    if (!('serial' in navigator)) {
        connectionStatus.textContent = '此瀏覽器不支援 Web Serial API，請使用 Chrome 或 Edge 瀏覽器';
        connectButton.disabled = true;
    }
});
