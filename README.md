# Arduino LED 控制器使用說明

這個專案允許您通過網頁界面控制 Arduino 連接的 LED 燈，調整亮度和閃爍頻率。

## 硬體需求

- Arduino UNO 或相容板
- LED 燈（任何顏色）
- 220 歐姆電阻（或適合您的 LED 的電阻）
- USB 數據線連接 Arduino 與電腦
- 支援 Web Serial API 的瀏覽器（Chrome 或 Edge）

## 線路連接

1. 將 LED 的正極（長腳）連接到 Arduino 的 9 號引腳
2. 將 220 歐姆電阻連接到 LED 的負極（短腳）
3. 將電阻的另一端連接到 Arduino 的 GND

線路示意圖：
```
Arduino Pin 9 ------ LED 正極 ------ LED 負極 ------ 電阻 ------ Arduino GND
```

## 軟體設置

### Arduino 設置

1. 下載並安裝 [Arduino IDE](https://www.arduino.cc/en/software)
2. 將 `arduino/LED_brightness_control.ino` 文件上傳至您的 Arduino
3. 記下 Arduino 連接的 COM 端口（可在 Arduino IDE 中查看）

### 網頁使用

1. 使用 Chrome 或 Edge 瀏覽器打開 `index.html` 文件
2. 點擊「連接 Arduino」按鈕
3. 在彈出的對話框中選擇與您 Arduino 對應的 COM 端口
4. 連接成功後，可以使用滑塊調整 LED 亮度和閃爍頻率

## 功能說明

- **亮度控制**：滑塊範圍為 0-255，0 表示完全熄滅，255 表示最亮
- **閃爍頻率**：滑塊範圍為 0-10，0 表示不閃爍，10 表示最快閃爍頻率

## 故障排除

如果點擊「連接 Arduino」按鈕後沒有反應，請檢查：

1. **瀏覽器相容性**：確保使用的是最新版本的 Chrome 或 Edge 瀏覽器
2. **Arduino 連接**：確認 Arduino 已正確連接到電腦，並且 COM 端口可用
3. **程式上傳**：確認已將正確的程式碼上傳至 Arduino
4. **瀏覽器控制台**：按 F12 打開開發者工具，查看控制台是否有錯誤訊息
5. **串口佔用**：確保沒有其他程式（如 Arduino IDE 的序列監視器）正在使用相同的 COM 端口

### 常見問題解決方法

- **無法選擇 COM 端口**：重新插拔 Arduino USB 數據線，或重啟瀏覽器
- **連接後無反應**：檢查 Arduino 程式是否正確上傳，波特率是否設置為 9600
- **LED 不亮**：檢查 LED 極性是否正確，以及是否連接到 9 號引腳
- **串口被佔用**：關閉可能占用 COM 端口的程式，如 Arduino IDE 的序列監視器

## 技術細節

- 前端使用純 HTML、CSS 和 JavaScript
- 通信使用 Web Serial API
- Arduino 通過串口接收命令格式：
  - 亮度：`L:數值\n`（數值範圍：0-255）
  - 閃爍頻率：`B:數值\n`（數值範圍：0-10）

## 自訂與擴展

- 修改 `script.js` 可更改控制邏輯
- 修改 `index.html` 和 CSS 樣式可更改界面
- 修改 Arduino 程式可支援更多功能，如 RGB LED 控制、多個 LED 控制等

## 聯絡與支援

如有任何問題或建議，請聯繫項目維護者。

---

© 2025 Arduino LED 控制器
