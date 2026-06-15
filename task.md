# 任務清單 - 北科大 Leaflet.js 地圖與學餐即時動態卡片 UI 改版

- `[x]` 1. 更新學餐資料庫 `data/restaurantData.js`：對齊類別名稱與排隊參數
- `[x]` 2. 更新校園網格 `data/campusGraph.js`：實作 28 個真實經緯度節點與相連邊
- `[x]` 3. 更新網頁架構 `index.html`：引入 Leaflet.js CDN、地圖容器、彈出地圖視窗與強制快取清理
- `[x]` 4. 重構核心邏輯 `script.js`：
  - `[x]` 4.1 手機版台北時間時鐘 Debug 與等待時間 NaN 防守
  - `[x]` 4.2 卡片即時動態 UI 改版（圖片、類別、時間、人數，拿掉擁擠等標籤）
  - `[x]` 4.3 Leaflet.js 地圖初始化與平面地圖 ImageOverlay 疊加
  - `[x]` 4.4 實作以 Haversine 距離為權重的 Dijkstra 演算法
  - `[x]` 4.5 實作 GPS 定位防呆轉換（校內最近點、校外 >500m 警告提示）
  - `[x]` 4.6 實作 Leaflet 畫線、圖標標記、每次重新規劃自動清除機制
  - `[x]` 4.7 實作 GPS 定位點沿線段移動的「模擬導航」動畫
  - `[x]` 4.8 綁定「開始規劃路線」、「模擬導航」、「關閉地圖」等按鈕，處理 modal 展開與 Leaflet 尺寸更新 (invalidateSize)
- `[x]` 5. 語法驗證與功能手動測試
