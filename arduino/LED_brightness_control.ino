/*
 * Arduino LED 亮度與閃爍頻率控制
 * 
 * 此程式接收來自Web Serial API的命令，
 * 控制連接到PWM引腳的LED亮度和閃爍頻率。
 * 
 * 連接方式：
 * - LED正極連接到Arduino UNO的9號引腳（PWM引腳）
 * - LED負極通過適當的電阻（約220歐姆）連接到GND
 */

// 定義LED引腳（必須是PWM引腳）
const int LED_PIN = 9;

// 儲存當前亮度值
int brightness = 0;

// 閃爍相關變數
int blinkRate = 0;        // 閃爍頻率 (0 表示不閃爍，1-10 表示閃爍速度)
unsigned long lastBlink = 0;  // 上次閃爍時間
int ledState = HIGH;      // LED 當前狀態
bool isBlinking = false;  // 是否正在閃爍

void setup() {
  // 初始化串口通信，設定鮑率為9600
  Serial.begin(9600);
  
  // 設定LED引腳為輸出模式
  pinMode(LED_PIN, OUTPUT);
  
  // 初始化LED亮度為0（關閉）
  analogWrite(LED_PIN, brightness);
  
  // 發送初始化完成訊息
  Serial.println("Arduino LED控制器已準備就緒");
}

// 計算閃爍間隔時間（毫秒）
unsigned long getBlinkInterval() {
  if (blinkRate <= 0) return 0; // 不閃爍
  
  // 將 1-10 的閃爍頻率轉換為實際閃爍間隔
  // 頻率越高，間隔越短 (100ms ~ 1000ms)
  return 1100 - (blinkRate * 100);
}

void loop() {
  // 處理LED閃爍
  if (blinkRate > 0) {
    isBlinking = true;
    unsigned long currentMillis = millis();
    unsigned long blinkInterval = getBlinkInterval();
    
    if (currentMillis - lastBlink >= blinkInterval) {
      lastBlink = currentMillis;
      
      // 切換LED狀態
      if (ledState == HIGH) {
        ledState = LOW;
        analogWrite(LED_PIN, 0); // 關閉LED
      } else {
        ledState = HIGH;
        analogWrite(LED_PIN, brightness); // 使用設定的亮度
      }
    }
  } else if (isBlinking) {
    // 停止閃爍，設為持續亮起狀態
    isBlinking = false;
    analogWrite(LED_PIN, brightness);
  }  // 檢查是否有串口數據可用
  if (Serial.available() > 0) {
    // 讀取命令字串
    String command = Serial.readStringUntil('\n');
    
    // 處理亮度控制命令
    if (command.startsWith("L:")) {
      // 解析亮度值
      String valueStr = command.substring(2);
      int newBrightness = valueStr.toInt();
      
      // 確保亮度值在有效範圍內（0-255）
      if (newBrightness >= 0 && newBrightness <= 255) {
        brightness = newBrightness;
        
        // 如果不是正在閃爍，立即設定LED亮度
        if (!isBlinking) {
          analogWrite(LED_PIN, brightness);
        }
        
        // 發送確認訊息
        Serial.print("已設定LED亮度為: ");
        Serial.println(brightness);
      } else {
        // 發送錯誤訊息
        Serial.println("錯誤: 亮度值必須在0-255之間");
      }
    }
    // 處理閃爍頻率控制命令
    else if (command.startsWith("B:")) {
      // 解析閃爍頻率值
      String valueStr = command.substring(2);
      int newBlinkRate = valueStr.toInt();
      
      // 確保頻率值在有效範圍內（0-10，0表示不閃爍）
      if (newBlinkRate >= 0 && newBlinkRate <= 10) {
        blinkRate = newBlinkRate;
        
        // 重置閃爍計時器
        lastBlink = millis();
        
        // 如果頻率為0，停止閃爍
        if (blinkRate == 0) {
          isBlinking = false;
          analogWrite(LED_PIN, brightness);
        }
        
        // 發送確認訊息
        Serial.print("已設定LED閃爍頻率為: ");
        Serial.println(blinkRate);
      } else {
        // 發送錯誤訊息
        Serial.println("錯誤: 閃爍頻率值必須在0-10之間");
      }
    }
  }
  
  // 短暫延遲以降低CPU使用率
  delay(10);
}
