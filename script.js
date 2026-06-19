// ==========================================================================
// 校園學餐等待時間規劃系統 - 核心前端 Orchestration 腳本 (真實經緯度 OpenStreetMap 版)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Data & 路網資料庫初始化
  const restaurants = window.restaurantData || [];
  let routeCalculated = false;

  const categoryMapping = {
    "自助餐": "便當",
    "韓式料理": "便當",
    "泰式料理": "便當",
    "中式輕食": "點心",
    "速食連鎖": "速食"
  };

  const googleMapsWalkTimes = {
    "第一教學大樓": 1,
    "第二教學大樓": 2,
    "第三教學大樓": 3,
    "第四教學大樓": 3,
    "第六教學大樓": 1,
    "設計館": 3,
    "材資館": 3,
    "土木館": 2,
    "化學工程館": 2,
    "分子科學工程館": 2,
    "共同科館": 4,
    "綜合科館": 5,
    "圖書館": 3,
    "行政大樓": 4,
    "藝文中心": 4,
    "紅樓": 2,
    "先鋒國際研發大樓": 5,
    "億光大樓": 10,
    "新生校門": 1,
    "新生側門": 3,
    "正校門": 5,
    "建國側門": 6,
    "東校區建國側門": 7,
    "國父百年紀念館": 1,
    "光華館": 1,
    "宏裕科技研究大樓": 1,
    "校友會館": 2,
    "校史館": 3
  };

  // ==========================================
  // 強制內建真實世界經緯度校園網路資料庫 (真實座標)
  // 【修正後的學餐光華館經緯度】：已將「學生餐廳」精確設定在光華館內部偏右下紅點位置：lat: 25.04425, lng: 121.53275
  // ==========================================
  const campusNodes = {
      // 【校區主要出入口 - 已對齊水平/垂直直角線】
      "正校門": { lat: 25.042205042013688, lng: 121.53542339646548, type: "gate" },
      "正校門轉角": { lat: 25.042205042013688, lng: 121.53470, type: "path" },
      "新生校門": { lat: 25.04390, lng: 121.53232, type: "gate" },
      "新生側門": { lat: 25.04250, lng: 121.53232, type: "gate" },
      "建國側門": { lat: 25.04250, lng: 121.53675, type: "gate" },
      "東校區建國側門": { lat: 25.04250, lng: 121.53725, type: "gate" },

      // 【西校區：教學大樓與設施 - 已對齊水平/垂直直角線】
      "共同科館": { lat: 25.04200, lng: 121.53450, type: "building" },
      "綜合科館": { lat: 25.04250, lng: 121.53580, type: "building" },
      "第三教學大樓": { lat: 25.04250, lng: 121.53420, type: "building" },
      "第一教學大樓": { lat: 25.04332, lng: 121.53350, type: "building" },
      "second_bld": { lat: 25.04332, lng: 121.53450, type: "building" },
      "第二教學大樓": { lat: 25.04332, lng: 121.53450, type: "building" },
      "第四教學大樓": { lat: 25.04250, lng: 121.53300, type: "building" },
      "第六教學大樓": { lat: 25.04390, lng: 121.53380, type: "building" },
      "宏裕科技研究大樓": { lat: 25.04390, lng: 121.53380, type: "building" },
      "光華館": { lat: 25.04390, lng: 121.53260, type: "building" },
      "國父百年紀念館": { lat: 25.04390, lng: 121.53260, type: "building" },
      "設計館": { lat: 25.04200, lng: 121.53300, type: "building" },
      "材資館": { lat: 25.04250, lng: 121.53280, type: "building" },
      "土木館": { lat: 25.04332, lng: 121.53280, type: "building" },
      "化學工程館": { lat: 25.04390, lng: 121.53460, type: "building" },
      "分子科學工程館": { lat: 25.04390, lng: 121.53520, type: "building" },
      "校友會館": { lat: 25.04390, lng: 121.53460, type: "building" },
      
      // 【西校區：行政與生活設施 - 已對齊水平/垂直直角線】
      // 學生餐廳精確設定在光華館旁綠光庭園：lat: 25.044027973087083, lng: 121.53328789865442
      "學生餐廳": { lat: 25.044027973087083, lng: 121.53328789865442, type: "restaurant" }, 
      "圖書館": { lat: 25.04332, lng: 121.53500, type: "building" },
      "行政大樓": { lat: 25.04250, lng: 121.53500, type: "building" },
      "藝文中心": { lat: 25.04200, lng: 121.53500, type: "building" },
      "校史館": { lat: 25.04250, lng: 121.53380, type: "building" },
      "紅樓": { lat: 25.04332, lng: 121.53420, type: "building" },

      // 【東校區：大樓與設施 - 已對齊直角線】
      "學生宿舍": { lat: 25.04380, lng: 121.53800, type: "building" },
      "網球場": { lat: 25.04340, lng: 121.53750, type: "sports" },
      "籃球場": { lat: 25.04380, lng: 121.53860, type: "sports" },
      "運動場": { lat: 25.04250, lng: 121.53820, type: "sports" },
      "億光大樓": { lat: 25.04160, lng: 121.53830, type: "building" },
      "先鋒國際研發大樓": { lat: 25.04200, lng: 121.53500, type: "building" },

      // 【校內隱形中庭走道、廣場直角轉折點 - 核心 3x4 網格系統】
      "西側主通道_設計館前": { lat: 25.04200, lng: 121.53328789865442, type: "path" },
      "西側主通道_材資館前": { lat: 25.04250, lng: 121.53328789865442, type: "path" },
      "西側通道_土木館東側": { lat: 25.04332, lng: 121.53328789865442, type: "path" },
      "北校區通道_光華館南側": { lat: 25.04390, lng: 121.53328789865442, type: "path" },

      "中庭廣場_共同科館前": { lat: 25.04200, lng: 121.53470, type: "path" },
      "中庭廣場_行政大樓前": { lat: 25.04250, lng: 121.53470, type: "path" },
      "中庭廣場_圖書館前": { lat: 25.04332, lng: 121.53470, type: "path" },
      "北側主通道_化學館前": { lat: 25.04390, lng: 121.53470, type: "path" },

      "東側主通道_綜合科館西側": { lat: 25.04250, lng: 121.53540, type: "path" },
      "東側主通道_學餐前路口": { lat: 25.04390, lng: 121.53540, type: "path" },

      "東校區主通道_宿舍前": { lat: 25.04380, lng: 121.53750, type: "path" },
      "東校區主通道_運動場旁": { lat: 25.04250, lng: 121.53750, type: "path" },
      "東校區_億光西側轉角": { lat: 25.04160, lng: 121.53725, type: "path" },
      "東校區_建國北側轉角": { lat: 25.04332, lng: 121.53725, type: "path" },
      "西校區_建國西側跨街點": { lat: 25.04332, lng: 121.53540, type: "path" },
      "北側主通道_化學館北轉角": { lat: 25.04410, lng: 121.53470, type: "path" },
      "學餐北側過渡點": { lat: 25.04410, lng: 121.53328789865442, type: "path" },
      
      // 【修復西校區與各處行人道微節點 coordinates】
      "通道_一教與二教間": { lat: 25.04332, lng: 121.53400, type: "path" },
      "通道_三教與校史館間": { lat: 25.04265, lng: 121.53380, type: "path" },
      "西側通道_工程學院轉角1": { lat: 25.04290, lng: 121.53320, type: "path" },
      "西側通道_工程學院轉角2": { lat: 25.04300, lng: 121.53318, type: "path" },
      "西側通道_土木館東側1": { lat: 25.04320, lng: 121.53315, type: "path" },
      "西側通道_土木館東側2": { lat: 25.04335, lng: 121.53312, type: "path" },
      "西側通道_衛生保健組旁": { lat: 25.04355, lng: 121.53305, type: "path" },
      "西側通道_海音咖啡轉角1": { lat: 25.04375, lng: 121.53295, type: "path" },
      "西側通道_海音咖啡轉角2": { lat: 25.04382, lng: 121.53285, type: "path" },
      "西側通道_土木館東側": { lat: 25.04332, lng: 121.53328789865442, type: "path" }
  };

  // ==========================================
  // 【刪除的穿牆連線明細以防穿牆】：
  // 1. 刪除 "學生餐廳" ↔ "東側主通道_學餐前路口" 的連線。
  // 2. 刪除 "西側主通道_材資館前" ↔ "北校區通道_光華館南側" 的直接大步長連線（改由微型轉折點一步步貼路連接）。
  // 3. 刪除 "新生校門" ↔ "北校區通道_光華館南側" 的連線（避免直接穿越百年紀念館，改由海音咖啡轉角2轉接）。
  // 4. 刪除 "通道_三教與校史館間" ↔ "通道_一教與二教間" 的連線。
  // 5. 刪除 "土木館" ↔ "通道_一教與二教間" 的直接連線。
  // ==========================================
  const rawGraph = {
      "正校門": { "正校門轉角": 80 },
      "正校門轉角": { "正校門": 80, "中庭廣場_共同科館前": 10 },
      "新生校門": { "西側通道_海音咖啡轉角2": 45 }, // 改為連接海音咖啡轉角2，避開直接穿牆百年紀念館
      "新生側門": { "西側主通道_材資館前": 50 },
      "建國側門": { "綜合科館": 60 },
      "東校區建國側門": { "東校區主通道_運動場旁": 30, "東校區_億光西側轉角": 100, "東校區_建國北側轉角": 80 },
      "共同科館": { "中庭廣場_共同科館前": 30 },
      "行政大樓": { "中庭廣場_行政大樓前": 20 },
      "圖書館": { "中庭廣場_圖書館前": 20 },
      "藝文中心": { "中庭廣場_共同科館前": 40 },
      "第三教學大樓": { "通道_三教與校史館間": 30, "中庭廣場_行政大樓前": 50 },
      "校史館": { "通道_三教與校史館間": 20 },
      "紅樓": { "通道_三教與校史館間": 40, "中庭廣場_圖書館前": 50 },
      "第一教學大樓": { "通道_一教與二教間": 30 },
      "second_bld": { "通道_一教與二教間": 30 },
      "第二教學大樓": { "通道_一教與二教間": 30, "中庭廣場_圖書館前": 20 },
      "第四教學大樓": { "西側主通道_材資館前": 30 },
      "設計館": { "西側主通道_設計館前": 20 },
      "材資館": { "西側主通道_材資館前": 20 },
      "土木館": { "西側通道_土木館東側": 40 },
      "綜合科館": { "東側主通道_綜合科館西側": 30, "建國側門": 60 },
      "先鋒國際研發大樓": { "中庭廣場_共同科館前": 120 },
      "第六教學大樓": { "北側主通道_化學館前": 50 },
      "宏裕科技研究大樓": { "北側主通道_化學館前": 70 },
      "化學工程館": { "北側主通道_化學館前": 30 },
      "分子科學工程館": { "東側主通道_學餐前路口": 40 },
      "校友會館": { "東側主通道_學餐前路口": 60 },
      "國父百年紀念館": { "北校區通道_光華館南側": 30 },
      "光華館": { "北校區通道_光華館南側": 20 },
      "學生餐廳": { "北校區通道_光華館南側": 20, "學餐北側過渡點": 8 }, // 鎖定光華館旁綠光庭園，並直連北側過渡點
      "學生宿舍": { "東校區主通道_宿舍前": 30 },
      "網球場": { "東校區主通道_宿舍前": 40, "東校區主通道_運動場旁": 100 },
      "籃球場": { "東校區主通道_宿舍前": 60 },
      "運動場": { "東校區主通道_運動場旁": 30 },
      "億光大樓": { "東校區_億光西側轉角": 25 },
      
      // 走道 Waypoints 網格連線 (西校區)
      "西側主通道_設計館前": { "設計館": 20, "西側主通道_材資館前": 80 },
      "西側主通道_材資館前": { "西側主通道_設計館前": 80, "新生側門": 50, "材資館": 20, "第四教學大樓": 30, "西側通道_工程學院轉角1": 25, "中庭廣場_行政大樓前": 140 },
      
      // 微型鏈狀連接，達到極其細緻的走道貼邊拐彎
      "西側通道_工程學院轉角1": { "西側主通道_材資館前": 25, "西側通道_工程學院轉角2": 10 },
      "西側通道_工程學院轉角2": { "西側通道_工程學院轉角1": 10, "西側通道_土木館東側1": 20 },
      "西側通道_土木館東側1": { "西側通道_工程學院轉角2": 20, "西側通道_土木館東側2": 15 },
      "西側通道_土木館東側2": { "西側通道_土木館東側1": 15, "西側通道_衛生保健組旁": 20 },
      "西側通道_衛生保健組旁": { "西側通道_土木館東側2": 20, "西側通道_海音咖啡轉角1": 20 },
      "西側通道_海音咖啡轉角1": { "西側通道_衛生保健組旁": 20, "西側通道_海音咖啡轉角2": 10 },
      "西側通道_海音咖啡轉角2": { "西側通道_海音咖啡轉角1": 10, "北校區通道_光華館南側": 15, "新生校門": 45 },

      "中庭廣場_共同科館前": { "共同科館": 30, "藝文中心": 40, "正校門轉角": 10, "中庭廣場_行政大樓前": 50 },
      "中庭廣場_行政大樓前": { "中庭廣場_共同科館前": 50, "行政大樓": 20, "東側主通道_綜合科館西側": 80, "中庭廣場_圖書館前": 40, "西側主通道_材資館前": 140 },
      "中庭廣場_圖書館前": { "中庭廣場_行政大樓前": 40, "圖書館": 20, "北側主通道_化學館前": 80 },
      "通道_三教與校史館間": { "校史館": 20, "第三教學大樓": 30, "紅樓": 40 },
      "通道_一教與二教間": { "第一教學大樓": 30, "第二教學大樓": 30, "北側主通道_化學館前": 50 },
      "東側主通道_綜合科館西側": { "行政大樓": 80, "綜合科館": 30, "東側主通道_學餐前路口": 110 },
      "北側主通道_化學館前": { "中庭廣場_圖書館前": 80, "通道_一教與二教間": 50, "化學工程館": 30, "第六教學大樓": 50, "宏裕科技研究大樓": 70, "東側主通道_學餐前路口": 60, "北校區通道_光華館南側": 110 },
      "北校區通道_光華館南側": { "國父百年紀念館": 30, "光華館": 20, "學生餐廳": 20, "西側通道_海音咖啡轉角2": 15 },
      "東側主通道_學餐前路口": { "北側主通道_化學館前": 60, "東側主通道_綜合科館西側": 110, "分子科學工程館": 40, "校友會館": 60 },
      "東校區主通道_宿舍前": { "學生宿舍": 30, "網球場": 40, "籃球場": 60 },
      "東校區主通道_運動場旁": { "東校區建國側門": 80, "運動場": 30 },
      
      // 新的億光大樓到學生餐廳正交折線點位連線
      "東校區_億光西側轉角": { "億光大樓": 25, "東校區建國側門": 100 },
      "東校區_建國北側轉角": { "東校區建國側門": 80, "西校區_建國西側跨街點": 185 },
      "西校區_建國西側跨街點": { "東校區_建國北側轉角": 185, "中庭廣場_圖書館前": 70 },
      "西側通道_土木館東側": { "土木館": 40, "西側通道_土木館東側2": 15 }
  };

  // ==========================================
  // 將 rawGraph 自動重組為無向、雙向容錯鄰接清單
  // ==========================================
  const campusGraph = {
    nodes: Object.keys(campusNodes),
    adjacencyList: {}
  };

  campusGraph.nodes.forEach(node => {
    campusGraph.adjacencyList[node] = [];
  });

  for (const fromNode in rawGraph) {
    for (const toNode in rawGraph[fromNode]) {
      const weight = rawGraph[fromNode][toNode];
      
      let correctedFrom = fromNode;
      let correctedTo = toNode;
      // 容錯拼字不一致 (如把 "通道_慢一教與二教間" 對應回 "通道_一教與二教間")
      if (fromNode === "通道_慢一教與二教間") correctedFrom = "通道_一教與二教間";
      if (toNode === "通道_慢一教與二教間") correctedTo = "通道_一教與二教間";

      if (campusNodes[correctedFrom] && campusNodes[correctedTo]) {
        // from -> to
        if (!campusGraph.adjacencyList[correctedFrom].some(e => e.to === correctedTo)) {
          campusGraph.adjacencyList[correctedFrom].push({ to: correctedTo, weight: weight });
        }
        // to -> from (無向圖強制雙向)
        if (!campusGraph.adjacencyList[correctedTo].some(e => e.to === correctedFrom)) {
          campusGraph.adjacencyList[correctedTo].push({ to: correctedFrom, weight: weight });
        }
      }
    }
  }

  // 台北時間 (UTC+8) Timezone-safe Clock & Time Utility
  function getTaipeiTime() {
    const now = new Date();
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Taipei",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      let hour = "", minute = "", second = "";
      for (const part of parts) {
        if (part.type === "hour") hour = part.value;
        if (part.type === "minute") minute = part.value;
        if (part.type === "second") second = part.value;
      }
      
      let hh = parseInt(hour, 10);
      let mm = parseInt(minute, 10);
      let ss = parseInt(second, 10);
      
      if (!isNaN(hh) && !isNaN(mm) && !isNaN(ss)) {
        if (hh === 24) hh = 0;
        return {
          hour: String(hh).padStart(2, '0'),
          minute: String(mm).padStart(2, '0'),
          second: String(ss).padStart(2, '0')
        };
      }
    } catch (e) {
      console.error("Intl clock error, fallback:", e);
    }

    const utcOffset = now.getTimezoneOffset() * 60000;
    const utcTime = now.getTime() + utcOffset;
    const taipeiDate = new Date(utcTime + (3600000 * 8));
    return {
      hour: String(taipeiDate.getHours()).padStart(2, '0'),
      minute: String(taipeiDate.getMinutes()).padStart(2, '0'),
      second: String(taipeiDate.getSeconds()).padStart(2, '0')
    };
  }

  function getTaipeiDateTime() {
    const now = new Date();
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Taipei",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        weekday: "short",
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      let hour = "", minute = "", second = "", weekday = "";
      for (const part of parts) {
        if (part.type === "hour") hour = part.value;
        if (part.type === "minute") minute = part.value;
        if (part.type === "second") second = part.value;
        if (part.type === "weekday") weekday = part.value;
      }
      
      let hh = parseInt(hour, 10);
      let mm = parseInt(minute, 10);
      let ss = parseInt(second, 10);
      
      if (!isNaN(hh) && !isNaN(mm) && !isNaN(ss)) {
        if (hh === 24) hh = 0;
        const dayMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
        const day = dayMap[weekday] !== undefined ? dayMap[weekday] : now.getDay();
        return { day, hour: hh, minute: mm, second: ss };
      }
    } catch (e) {
      console.error("Intl datetime error, fallback:", e);
    }

    const utcOffset = now.getTimezoneOffset() * 60000;
    const utcTime = now.getTime() + utcOffset;
    const taipeiDate = new Date(utcTime + (3600000 * 8));
    return {
      day: taipeiDate.getDay(),
      hour: taipeiDate.getHours(),
      minute: taipeiDate.getMinutes(),
      second: taipeiDate.getSeconds()
    };
  }

  // 餐廳營業時段判定
  function isRestaurantOpen(name, day, hour, minute) {
    const mins = hour * 60 + minute;
    
    if (name.includes("宣坊")) {
      if (day >= 1 && day <= 6) { // 週一至週六
        return mins >= 630 && mins <= 1170; // 10:30 - 19:30
      } else if (day === 0) { // 週日
        return mins >= 630 && mins <= 930; // 10:30 - 15:30
      }
    }
    
    if (name.includes("摩斯")) {
      if (day >= 1 && day <= 5) { // 週一至週五
        return mins >= 450 && mins <= 1170; // 07:30 - 19:30
      } else { // 週六日與例假日
        return mins >= 480 && mins <= 1140; // 08:00 - 19:00
      }
    }
    
    if (name.includes("麗宴")) {
      if (day >= 1 && day <= 5) { // 週一至週五
        return (mins >= 660 && mins <= 810) || (mins >= 990 && mins <= 1160); // 11:00-13:30 / 16:30-19:20
      } else {
        return false; // 六日休息
      }
    }
    
    if (name.includes("天津")) {
      if (day >= 1 && day <= 5) { // 週一至週五
        return mins >= 480 && mins <= 1140; // 08:00 - 19:00
      } else {
        return false; // 六日休息
      }
    }
    
    if (name.includes("喜歡你")) {
      if (day >= 1 && day <= 5) { // 週一至週五
        return mins >= 600 && mins <= 1140; // 10:00 - 19:00
      } else {
        return false; // 六日休息
      }
    }
    
    return true; // 預設開啟
  }

  // Forecast formula based on Google Sheet data
  function getSpreadsheetForecast(canteenName, day, hour, minute) {
    const defaultForecast = { minQueue: 5, maxQueue: 10, minCook: 1.5, maxCook: 2, buyTime: 2 };
    
    // Day fallback for weekends (0 = Sunday, 6 = Saturday) -> map to Monday (1)
    let targetDay = day;
    if (targetDay === 0 || targetDay === 6) {
      targetDay = 1;
    }

    const timeInMinutes = hour * 60 + minute;
    // 12:30 ~ 13:00 is Peak
    const isPeak = timeInMinutes >= 750 && timeInMinutes < 780;
    
    const db = {
      1: { // Mon
        peak: {
          "摩斯漢堡": { minQueue: 10, maxQueue: 16, minCook: 1, maxCook: 1.5 },
          "喜歡你飯捲年糕": { minQueue: 1, maxQueue: 3, minCook: 1.5, maxCook: 2 },
          "天津蔥抓餅": { minQueue: 3, maxQueue: 4, minCook: 2, maxCook: 3 },
          "宣坊泰式料理": { minQueue: 2, maxQueue: 10, minCook: 2, maxCook: 3 },
          "麗宴精緻自助餐": { minQueue: 20, maxQueue: 40, buyTime: 2 }
        },
        offPeak: {
          "摩斯漢堡": { minQueue: 2, maxQueue: 6, minCook: 1.5, maxCook: 2 },
          "喜歡你飯捲年糕": { minQueue: 1, maxQueue: 1, minCook: 2, maxCook: 2 },
          "天津蔥抓餅": { minQueue: 2, maxQueue: 3, minCook: 2, maxCook: 3 },
          "宣坊泰式料理": { minQueue: 1, maxQueue: 2, minCook: 2, maxCook: 2 },
          "麗宴精緻自助餐": { minQueue: 10, maxQueue: 20, buyTime: 2 }
        }
      },
      2: { // Tue
        peak: {
          "摩斯漢堡": { minQueue: 6, maxQueue: 12, minCook: 1, maxCook: 1.5 },
          "喜歡你飯捲年糕": { minQueue: 1, maxQueue: 4, minCook: 2, maxCook: 6 },
          "天津蔥抓餅": { minQueue: 2, maxQueue: 5, minCook: 2, maxCook: 3 },
          "宣坊泰式料理": { minQueue: 1, maxQueue: 4, minCook: 5, maxCook: 7 },
          "麗宴精緻自助餐": { minQueue: 20, maxQueue: 40, buyTime: 2 }
        },
        offPeak: {
          "摩斯漢堡": { minQueue: 2, maxQueue: 3, minCook: 1.5, maxCook: 2 },
          "喜歡你飯捲年糕": { minQueue: 1, maxQueue: 2, minCook: 2, maxCook: 3 },
          "天津蔥抓餅": { minQueue: 1, maxQueue: 3, minCook: 2, maxCook: 4 },
          "宣坊泰式料理": { minQueue: 1, maxQueue: 1, minCook: 2, maxCook: 2 },
          "麗宴精緻自助餐": { minQueue: 1, maxQueue: 1, buyTime: 2 }
        }
      },
      3: { // Wed
        peak: {
          "摩斯漢堡": { minQueue: 10, maxQueue: 17, minCook: 1, maxCook: 1.5 },
          "喜歡你飯捲年糕": { minQueue: 3, maxQueue: 6, minCook: 2, maxCook: 4 },
          "天津蔥抓餅": { minQueue: 2, maxQueue: 6, minCook: 2, maxCook: 4 },
          "宣坊泰式料理": { minQueue: 2, maxQueue: 8, minCook: 2, maxCook: 3 },
          "麗宴精緻自助餐": { minQueue: 25, maxQueue: 45, buyTime: 2 }
        },
        offPeak: {
          "摩斯漢堡": { minQueue: 4, maxQueue: 6, minCook: 1, maxCook: 1.5 },
          "喜歡你飯捲年糕": { minQueue: 1, maxQueue: 1, minCook: 2, maxCook: 2 },
          "天津蔥抓餅": { minQueue: 1, maxQueue: 2, minCook: 2, maxCook: 2 },
          "宣坊泰式料理": { minQueue: 1, maxQueue: 1, minCook: 3, maxCook: 3 },
          "麗宴精緻自助餐": { minQueue: 1, maxQueue: 1, buyTime: 2 }
        }
      },
      4: { // Thu
        peak: {
          "摩斯漢堡": { minQueue: 10, maxQueue: 18, minCook: 1, maxCook: 1.5 },
          "喜歡你飯捲年糕": { minQueue: 1, maxQueue: 3, minCook: 2, maxCook: 6 },
          "天津蔥抓餅": { minQueue: 4, maxQueue: 12, minCook: 1, maxCook: 2 },
          "宣坊泰式料理": { minQueue: 1, maxQueue: 7, minCook: 2, maxCook: 6 },
          "麗宴精緻自助餐": { minQueue: 30, maxQueue: 55, buyTime: 2 }
        },
        offPeak: {
          "摩斯漢堡": { minQueue: 6, maxQueue: 9, minCook: 1, maxCook: 1.5 },
          "喜歡你飯捲年糕": { minQueue: 1, maxQueue: 2, minCook: 2, maxCook: 5 },
          "天津蔥抓餅": { minQueue: 1, maxQueue: 4, minCook: 1, maxCook: 2 },
          "宣坊泰式料理": { minQueue: 1, maxQueue: 1, minCook: 3, maxCook: 5 },
          "麗宴精緻自助餐": { minQueue: 1, maxQueue: 3, buyTime: 2 }
        }
      },
      5: { // Fri
        peak: {
          "摩斯漢堡": { minQueue: 9, maxQueue: 17, minCook: 0.8, maxCook: 1.5 },
          "喜歡你飯捲年糕": { minQueue: 2, maxQueue: 4, minCook: 1, maxCook: 2 },
          "天津蔥抓餅": { minQueue: 1, maxQueue: 3, minCook: 2, maxCook: 3 },
          "宣坊泰式料理": { minQueue: 1, maxQueue: 3, minCook: 2, maxCook: 4 },
          "麗宴精緻自助餐": { minQueue: 15, maxQueue: 32, buyTime: 2 }
        },
        offPeak: {
          "摩斯漢堡": { minQueue: 3, maxQueue: 5, minCook: 1, maxCook: 1.5 },
          "喜歡你飯捲年糕": { minQueue: 1, maxQueue: 1, minCook: 1, maxCook: 2 },
          "天津蔥抓餅": { minQueue: 3, maxQueue: 8, minCook: 2, maxCook: 3 },
          "宣坊泰式料理": { minQueue: 1, maxQueue: 1, minCook: 2, maxCook: 3 },
          "麗宴精緻自助餐": { minQueue: 10, maxQueue: 21, buyTime: 2 }
        }
      }
    };

    const dayData = db[targetDay] || db[1];
    const periodData = isPeak ? dayData.peak : dayData.offPeak;
    const canteenData = periodData[canteenName] || defaultForecast;

    // 1. Calculate macro time-of-day factor (f_time)
    let f_time = 0.1; // Default fallback for off-meal hours
    
    if (timeInMinutes >= 660 && timeInMinutes <= 840) {
      // Lunch window: 11:00 (660) to 14:00 (840)
      if (timeInMinutes < 720) {
        // 11:00 - 12:00: linear ramp up from 0.1 to 1.0
        f_time = 0.1 + 0.9 * ((timeInMinutes - 660) / 60);
      } else if (timeInMinutes <= 780) {
        // 12:00 - 13:00: lunch peak
        f_time = 1.0;
      } else {
        // 13:00 - 14:00: linear ramp down from 1.0 to 0.1
        f_time = 0.1 + 0.9 * ((840 - timeInMinutes) / 60);
      }
    } else if (timeInMinutes >= 1020 && timeInMinutes <= 1170) {
      // Dinner window: 17:00 (1020) to 19:30 (1170)
      if (timeInMinutes < 1080) {
        // 17:00 - 18:00: ramp up from 0.1 to 0.8
        f_time = 0.1 + 0.7 * ((timeInMinutes - 1020) / 60);
      } else if (timeInMinutes <= 1125) {
        // 18:00 - 18:45: dinner peak
        f_time = 0.8;
      } else {
        // 18:45 - 19:30: ramp down from 0.8 to 0.1
        f_time = 0.1 + 0.7 * ((1170 - timeInMinutes) / 45);
      }
    }
    
    // 2. Calculate micro fluctuation factor (f_micro)
    // Use a sine wave with a 10-minute period for fast-changing but smooth fluctuations
    const f_micro = 0.15 * Math.sin(timeInMinutes * Math.PI / 5);
    
    // 3. Combine and clamp factor
    let f_total = Math.max(0.05, Math.min(1.2, f_time + f_micro));

    const minQueue = Math.max(0, Math.round(canteenData.minQueue * f_total));
    const maxQueue = Math.max(minQueue, Math.round(canteenData.maxQueue * f_total));
    const minCook = canteenData.minCook || 2;
    const maxCook = canteenData.maxCook || 2;
    const buyTime = canteenData.buyTime || 2;

    let waitTime = 10;
    if (canteenName === "麗宴精緻自助餐") {
      const minWait = minQueue > 0 ? (buyTime + (minQueue - 1) * 0.33) : 0;
      const maxWait = maxQueue > 0 ? (buyTime + (maxQueue - 1) * 0.33) : 0;
      waitTime = Math.round((minWait + maxWait) / 2);
    } else {
      const minWait = minQueue * minCook;
      const maxWait = maxQueue * maxCook;
      waitTime = Math.round((minWait + maxWait) / 2);
    }

    return {
      minQueue,
      maxQueue,
      waitTime: isNaN(waitTime) ? 10 : Math.max(1, waitTime)
    };
  }

  function getDynamicAiReport(storeName, waitTime) {
    let aiStatus = "";
    let aiText = "";
    let aiClass = "";
    
    if (waitTime <= 10) {
      aiStatus = "🟢 人潮少";
      aiClass = "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      if (storeName === "麗宴精緻自助餐") {
        aiText = `目前自助餐結帳與夾菜人流順暢，預估等待僅 ${waitTime} 分鐘，是極佳的用餐選擇。`;
      } else if (storeName === "喜歡你飯捲年糕") {
        aiText = `飯捲製作快速且隊伍長度極短，預估等候時間僅 ${waitTime} 分鐘，推薦立即購買。`;
      } else if (storeName === "天津蔥抓餅") {
        aiText = `排隊人數極少，製餐快速，目前只需等候大約 ${waitTime} 分鐘即可享用酥脆抓餅。`;
      } else if (storeName === "摩斯漢堡") {
        aiText = `目前點餐人潮少，預估僅需 ${waitTime} 分鐘即可領餐，適合快速解決一餐。`;
      } else if (storeName === "宣坊泰式料理") {
        aiText = `泰式料理目前出餐順暢，排隊人潮已消散，預估等待僅 ${waitTime} 分鐘。`;
      } else {
        aiText = `目前人潮較少，製餐迅速，預估等待僅 ${waitTime} 分鐘即可用餐。`;
      }
    } else if (waitTime <= 18) {
      aiStatus = "🟡 人潮普通";
      aiClass = "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      if (storeName === "麗宴精緻自助餐") {
        aiText = `夾菜與結帳隊伍前進平穩，略需排隊，整體大約需要等候 ${waitTime} 分鐘左右。`;
      } else if (storeName === "喜歡你飯捲年糕") {
        aiText = `排隊隊伍長度一般，韓式美味現點現做，預估需等候 ${waitTime} 分鐘，是風味與時間的平衡點。`;
      } else if (storeName === "天津蔥抓餅") {
        aiText = `現點現煎需略微等待，隊伍前進尚可，預估大約需要 ${waitTime} 分鐘。`;
      } else if (storeName === "摩斯漢堡") {
        aiText = `摩斯漢堡人流一般，現做漢堡需要等候 ${waitTime} 分鐘，可先點餐稍候。`;
      } else if (storeName === "宣坊泰式料理") {
        aiText = `泰式椒麻雞與咖哩飯人氣適中，預估出餐需要 ${waitTime} 分鐘。`;
      } else {
        aiText = `排隊隊伍長度適中，預估需要等候 ${waitTime} 分鐘左右，仍屬合理用餐時間。`;
      }
    } else {
      aiStatus = "🔴 稍嫌擁擠";
      aiClass = "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30";
      if (storeName === "麗宴精緻自助餐") {
        aiText = `正值熱門用餐時段，夾菜與結帳隊伍人流極多，預估需要等候 ${waitTime} 分鐘，建議避開人潮。`;
      } else if (storeName === "喜歡你飯捲年糕") {
        aiText = `點餐人數較多，現做飯捲與年糕出餐較慢，預估需要等候長達 ${waitTime} 分鐘。`;
      } else if (storeName === "天津蔥抓餅") {
        aiText = `排隊隊伍較長，現煎抓餅速度有限，預估需要等候大約 ${waitTime} 分鐘。`;
      } else if (storeName === "摩斯漢堡") {
        aiText = `點餐人潮擁擠且現點現做，預估等待時間長達 ${waitTime} 分鐘，趕時間的同學建議先避開。`;
      } else if (storeName === "宣坊泰式料理") {
        aiText = `熱門餐點現炸椒麻雞等製程費時，排隊較為擁擠，預估需等候 ${waitTime} 分鐘。`;
      } else {
        aiText = `現場用餐與排隊人潮眾多，等待時間長達 ${waitTime} 分鐘，建議可以晚點再來訪。`;
      }
    }
    
    return { aiStatus, aiText, aiClass };
  }

  function calculateWaitTimes() {
    const timeData = getTaipeiDateTime();
    restaurants.forEach(r => {
      const forecast = getSpreadsheetForecast(r.name, timeData.day, timeData.hour, timeData.minute);
      r.minQueue = forecast.minQueue;
      r.maxQueue = forecast.maxQueue;
      r.waitTime = forecast.waitTime;
    });
  }

  calculateWaitTimes();

  // 餐廳詳細設定與美食照
  const storeDetailsConfig = {
    "天津蔥抓餅": {
      img: "data/onioncake.png",
      queue: "3 人",
      speed: "3.3 分/人",
      menu: ["原味蔥抓餅 ($35)", "抓餅加蛋+起司+熱可可套餐 ($65)", "九層塔起司蛋抓餅 ($55)"],
      aiStatus: "🟢 人潮少",
      aiText: "排隊人數極少，製餐快速，目前不需等候即可享用熱騰騰的酥脆抓餅。",
      aiClass: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
    },
    "喜歡你飯捲年糕": {
      img: "data/gimbap.png",
      queue: "6 人",
      speed: "2 分/人",
      menu: ["招牌燒肉飯捲 ($75)", "辣炒年糕 ($100)", "韓式牛肉拌飯 ($90)"],
      aiStatus: "🟡 人潮普通",
      aiText: "排隊隊伍長度一般，韓式美味現做需等候 12 分鐘，是效率與風味的平衡點。",
      aiClass: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
    },
    "麗宴精緻自助餐": {
      img: "data/buffet.png",
      queue: "15 人",
      speed: "0.33 分/人",
      menu: ["高麗菜", "櫛瓜", "炸湯圓", "炸地瓜", "糖醋排骨"],
      aiStatus: "🟡 人潮普通",
      aiText: "菜色選擇多樣，夾菜隊伍前進平穩，結帳秤重略需排隊，整體大約需要 15 分鐘。",
      aiClass: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
    },
    "摩斯漢堡": {
      img: "data/mosburger.png",
      queue: "12 人",
      speed: "1.67 分/人",
      menu: ["藜麥燒肉珍珠堡 ($115)", "摩斯鱈魚堡 ($85)", "摩斯冰紅茶 ($45)"],
      aiStatus: "🔴 稍嫌擁擠",
      aiText: "點餐人數較多，且為現點現做，等待時間長達 20 分鐘，趕時間的同學建議先避開。",
      aiClass: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
    },
    "宣坊泰式料理": {
      img: "data/xuanfang.png",
      queue: "18 人",
      speed: "1.39 分/人",
      menu: ["泰式椒麻雞飯 ($120)", "打拋豬肉飯 ($90)", "椰汁綠咖哩雞飯 ($110)"],
      aiStatus: "🔴 擁擠",
      aiText: "熱門用餐時段，排隊人數多達 18 人，等待大約 25 分鐘，可先參觀其他或晚點再來。",
      aiClass: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
    }
  };

  // ==========================================
  // 2. DOM Elements Selection
  // ==========================================
  const navLogo = document.getElementById("nav-logo");
  const navDashboard = document.getElementById("nav-dashboard");
  const navRecommend = document.getElementById("nav-recommend");
  const navRoute = document.getElementById("nav-route");
  const btnMobileMenu = document.getElementById("btn-mobile-menu");
  const mobileNav = document.getElementById("mobile-nav");
  const mainContent = document.getElementById("main-content");
  const mobNavDashboard = document.getElementById("mob-nav-dashboard");
  const mobNavRecommend = document.getElementById("mob-nav-recommend");
  const mobNavRoute = document.getElementById("mob-nav-route");
  const clockText = document.getElementById("nav-real-time");

  const tabDashboardContainer = document.getElementById("tab-dashboard-container");
  const tabRecommendContainer = document.getElementById("tab-recommend-container");
  const tabRouteContainer = document.getElementById("tab-route-container");

  const dashboardGrid = document.getElementById("dashboard-grid");
  const selectDashboardSort = document.getElementById("select-dashboard-sort");
  const btnDashboardRefresh = document.getElementById("btn-dashboard-refresh");
  const bannerRecommendName = document.getElementById("banner-recommend-name");
  const bannerRecommendTime = document.getElementById("banner-recommend-time");
  const btnBannerGo = document.getElementById("btn-banner-go");
  const btnHeroExplore = document.getElementById("btn-hero-explore");
  const btnHeroRoute = document.getElementById("btn-hero-route");

  const recommendTimeInput = document.getElementById("recommend-current-time");
  const recommendCategorySelect = document.getElementById("recommend-category");
  const recommendMaxWaitInput = document.getElementById("recommend-max-wait");
  const btnRecommendSubmit = document.getElementById("btn-recommend-submit");

  const recommendReportCard = document.getElementById("recommend-report-card");
  const repRecommendName = document.getElementById("rep-recommend-name");
  const repWaitTime = document.getElementById("rep-wait-time");
  const repFinishTime = document.getElementById("rep-finish-time");
  const repInfoAlert = document.getElementById("rep-info-alert");

  const featuredChoiceContainer = document.getElementById("featured-choice-container");
  const secondaryOptionsPanel = document.getElementById("secondary-options-panel");
  const notRecommendedPanel = document.getElementById("not-recommended-panel");
  const recommendEmptyState = document.getElementById("recommend-empty-state");

  const featuredImg = document.getElementById("featured-img");
  const featuredName = document.getElementById("featured-name");
  const featuredTotalTime = document.getElementById("featured-total-time");
  const featuredWaitTime = document.getElementById("featured-wait-time");
  const featuredType = document.getElementById("featured-type");
  const featuredReasons = document.getElementById("featured-reasons");

  const routeStartNode = document.getElementById("route-start-node");
  const routeEndNode = document.getElementById("route-end-node");
  const btnRouteSubmit = document.getElementById("btn-route-submit");
  const btnGpsLocate = document.getElementById("btn-gps-locate");
  const gpsRouteStatus = document.getElementById("gps-route-status");
  
  const kpiWalkTime = document.getElementById("kpi-walk-time");
  const kpiWaitTime = document.getElementById("kpi-wait-time");
  const kpiTotalTime = document.getElementById("kpi-total-time");
  const kpiStatusBadge = document.getElementById("kpi-status-badge");
  
  const routeBetterChoiceCard = document.getElementById("route-better-choice-card");
  const betterCanteenName = document.getElementById("better-canteen-name");
  const betterWalkTime = document.getElementById("better-walk-time");
  const betterWaitTime = document.getElementById("better-wait-time");
  const betterTotalTime = document.getElementById("better-total-time");
  const betterSavings = document.getElementById("better-savings");
  const btnRouteSwitchTarget = document.getElementById("btn-route-switch-target");

  const storeModal = document.getElementById("store-modal");
  const modalOverlay = document.getElementById("modal-overlay");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnModalCloseFallback = document.getElementById("btn-modal-close-fallback");
  const btnModalActionRecommend = document.getElementById("btn-modal-action-recommend");
  
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalWait = document.getElementById("modal-wait");
  const modalQueue = document.getElementById("modal-queue");
  const modalMenu = document.getElementById("modal-menu");
  const modalAiReport = document.getElementById("modal-ai-report");

  const mapModal = document.getElementById("map-modal");
  const btnCloseMapModal = document.getElementById("btn-close-map-modal");
  const btnModalCloseMap = document.getElementById("btn-modal-close-map");
  const mapModalOverlay = document.getElementById("map-modal-overlay");
  const btnModalSimulate = document.getElementById("btn-modal-simulate");
  
  const mapModalStartName = document.getElementById("map-modal-start-name");
  const mapModalEndName = document.getElementById("map-modal-end-name");
  const modalKpiWalk = document.getElementById("modal-kpi-walk");
  const modalKpiWait = document.getElementById("modal-kpi-wait");
  const modalKpiTotal = document.getElementById("modal-kpi-total");
  const modalGpsWarning = document.getElementById("modal-gps-warning");
  const modalGpsWarningText = document.getElementById("modal-gps-warning-text");

  // ==========================================
  // 3. Leaflet Map Initialization (真實 OpenStreetMap 底圖)
  // ==========================================
  let userCoords = null;
  let isUsingFallbackGps = false;
  const campusCenter = [25.0433, 121.5345]; // 北科大真實校園中心點

  // 時鐘與時間輸入初始化
  function updateRealTimeClock() {
    const time = getTaipeiTime();
    clockText.innerHTML = `<b>${time.hour}:${time.minute}:${time.second}</b>`;
    
    // Recalculate wait times and re-render dashboard grid every 15 seconds
    const sec = parseInt(time.second, 10);
    if (sec % 15 === 0) {
      calculateWaitTimes();
      renderDashboardGrid();
      updateDashboardRecommendationBanner();
    }
  }
  
  function initTimeInputs() {
    const time = getTaipeiTime();
    if (recommendTimeInput) {
      recommendTimeInput.value = `${time.hour}:${time.minute}`;
    }
  }

  updateRealTimeClock();
  setInterval(updateRealTimeClock, 1000);
  initTimeInputs();

  // Tab 分頁切換
  const activeNavClass = "font-label-md text-label-md text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 font-bold transition-all";
  const inactiveNavClass = "font-label-md text-label-md text-on-surface-variant dark:text-surface-variant font-medium hover:text-primary transition-colors duration-300 pb-1";

  const activeMobNavClass = "w-full text-left text-xs font-bold text-primary bg-primary-fixed-dim/20 py-1.5 px-2 rounded-lg hover:bg-surface-container transition-all";
  const inactiveMobNavClass = "w-full text-left text-xs font-medium text-on-surface-variant dark:text-surface-variant py-1.5 px-2 rounded-lg hover:bg-surface-container transition-all";

  function toggleMobileMenu() {
    const isExpanded = mobileNav.classList.contains("opacity-100");
    if (isExpanded) {
      mobileNav.classList.remove("max-h-64", "opacity-100", "pointer-events-auto");
      mobileNav.classList.add("max-h-0", "opacity-0", "pointer-events-none");
      mainContent.classList.remove("translate-x-12");
    } else {
      mobileNav.classList.remove("max-h-0", "opacity-0", "pointer-events-none");
      mobileNav.classList.add("max-h-64", "opacity-100", "pointer-events-auto");
      mainContent.classList.add("translate-x-12");
    }
  }

  function switchTab(targetTab) {
    tabDashboardContainer.classList.add("hidden");
    tabRecommendContainer.classList.add("hidden");
    tabRouteContainer.classList.add("hidden");

    navDashboard.className = inactiveNavClass;
    navRecommend.className = inactiveNavClass;
    navRoute.className = inactiveNavClass;

    mobNavDashboard.className = inactiveMobNavClass;
    mobNavRecommend.className = inactiveMobNavClass;
    mobNavRoute.className = inactiveMobNavClass;

    if (targetTab === "dashboard") {
      tabDashboardContainer.classList.remove("hidden");
      navDashboard.className = activeNavClass;
      mobNavDashboard.className = activeMobNavClass;
      renderDashboardGrid();
    } else if (targetTab === "recommend") {
      tabRecommendContainer.classList.remove("hidden");
      navRecommend.className = activeNavClass;
      mobNavRecommend.className = activeMobNavClass;
      calculateSmartRecommendations();
    } else if (targetTab === "route") {
      tabRouteContainer.classList.remove("hidden");
      navRoute.className = activeNavClass;
      mobNavRoute.className = activeMobNavClass;
      calculateRoutePlanner();
    }
    
    mobileNav.classList.remove("max-h-64", "opacity-100", "pointer-events-auto");
    mobileNav.classList.add("max-h-0", "opacity-0", "pointer-events-none");
    mainContent.classList.remove("translate-x-12");
  }

  navLogo.addEventListener("click", () => switchTab("dashboard"));
  navDashboard.addEventListener("click", () => switchTab("dashboard"));
  navRecommend.addEventListener("click", () => switchTab("recommend"));
  navRoute.addEventListener("click", () => switchTab("route"));

  mobNavDashboard.addEventListener("click", () => switchTab("dashboard"));
  mobNavRecommend.addEventListener("click", () => switchTab("recommend"));
  mobNavRoute.addEventListener("click", () => switchTab("route"));
  btnMobileMenu.addEventListener("click", toggleMobileMenu);

  btnHeroExplore.addEventListener("click", () => switchTab("recommend"));
  btnHeroRoute.addEventListener("click", () => switchTab("route"));

  // ==========================================
  // 4. Dijkstra 最短路徑演算法 (真實經緯度版)
  // ==========================================
  // 計算兩點經緯度真實世界距離 (Haversine 距離公式，公尺)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 地球半徑 (公尺)
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 公尺
  }

  // 標準 Dijkstra 最短路徑尋路演算法
  function findShortestPath(graphData, startNode, endNode) {
    let distances = {};
    let visited = new Set();
    let prevNodes = {};

    graphData.nodes.forEach(node => {
      distances[node] = Infinity;
      prevNodes[node] = null;
    });
    distances[startNode] = 0;

    while (visited.size < graphData.nodes.length) {
      let minDistance = Infinity;
      let u = null;

      graphData.nodes.forEach(node => {
        if (!visited.has(node) && distances[node] < minDistance) {
          minDistance = distances[node];
          u = node;
        }
      });

      if (u === null) break;
      if (u === endNode) break;

      visited.add(u);
      
      const neighbors = graphData.adjacencyList[u] || [];
      neighbors.forEach(edge => {
        const v = edge.to;
        const weight = edge.weight;

        if (visited.has(v)) return;

        const altDist = distances[u] + weight;
        if (altDist < distances[v]) {
          distances[v] = altDist;
          prevNodes[v] = u;
        }
      });
    }

    let path = [];
    let current = endNode;
    while (current !== null) {
      path.push(current);
      current = prevNodes[current];
    }
    path.reverse();

    if (distances[endNode] === Infinity) {
      return { distance: Infinity, path: [] };
    }

    return {
      distance: distances[endNode], // 距離 (公尺)
      path: path
    };
  }

  // ==========================================
  // 5. Tab 1: 等待時間卡片渲染與刷新
  // ==========================================
  function renderDashboardGrid() {
    dashboardGrid.innerHTML = "";
    let renderList = [...restaurants];
    const timeData = getTaipeiDateTime();

    const dashboardSortMode = selectDashboardSort.value;
    renderList.sort((a, b) => {
      const aOpen = isRestaurantOpen(a.name, timeData.day, timeData.hour, timeData.minute);
      const bOpen = isRestaurantOpen(b.name, timeData.day, timeData.hour, timeData.minute);
      
      if (aOpen && !bOpen) return -1;
      if (!aOpen && bOpen) return 1;
      
      if (dashboardSortMode === "wait-asc") {
        return a.waitTime - b.waitTime;
      } else if (dashboardSortMode === "wait-desc") {
        return b.waitTime - a.waitTime;
      }
      return 0;
    });

    renderList.forEach(r => {
      const isOpen = isRestaurantOpen(r.name, timeData.day, timeData.hour, timeData.minute);
      const storeConfig = storeDetailsConfig[r.name] || { img: "data/cafeteria.png" };

      const card = document.createElement("div");
      card.className = "bg-surface-container-lowest rounded-24 overflow-hidden shadow-[0px_4px_16px_rgba(121,84,46,0.04)] hover:shadow-[0px_10px_30px_rgba(121,84,46,0.08)] border border-outline-variant/30 group hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-[280px]";
      
      let bottomContent = "";
      if (!isOpen) {
        bottomContent = `
          <div class="pt-3 border-t border-outline-variant/20 flex justify-center items-center w-full">
            <span class="text-sm font-extrabold text-red-500 dark:text-red-400 flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">block</span>目前非營業時段
            </span>
          </div>
        `;
      } else {
        let waitColor = "text-emerald-500 dark:text-emerald-400";
        if (r.waitTime > 10 && r.waitTime <= 18) {
          waitColor = "text-amber-500 dark:text-amber-400";
        } else if (r.waitTime > 18) {
          waitColor = "text-red-500 dark:text-red-400";
        }
        const currentQueue = Math.round((r.minQueue + r.maxQueue) / 2);
        
        bottomContent = `
          <div class="pt-3 border-t border-outline-variant/20 flex justify-between items-center w-full">
            <span class="text-sm font-extrabold ${waitColor} flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">schedule</span>${r.waitTime}m
            </span>
            <span class="text-sm font-bold text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">group</span>${currentQueue}人
            </span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="relative h-36 w-full overflow-hidden shrink-0">
          <img src="${storeConfig.img}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${r.name}"/>
          <div class="absolute top-3 left-3 z-10">
            <span class="px-2.5 py-0.5 rounded text-[10px] bg-white/95 dark:bg-[#1a1a1a]/95 text-on-surface font-extrabold shadow-sm border border-outline-variant/20 tracking-wider">
              ${r.type}
            </span>
          </div>
        </div>
        <div class="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h4 class="text-base text-on-surface dark:text-[#fcf9f5] font-extrabold group-hover:text-primary transition-colors line-clamp-1">${r.name}</h4>
          </div>
          ${bottomContent}
        </div>
      `;
      
      card.addEventListener("click", () => openStoreModal(r.name));
      dashboardGrid.appendChild(card);
    });
  }

  selectDashboardSort.addEventListener("change", renderDashboardGrid);

  function updateDashboardRecommendationBanner() {
    // 確保即時時間與等待時間已更新
    calculateWaitTimes();

    let bestCanteen = null;
    let minWaitTime = Infinity;
    const timeData = getTaipeiDateTime();

    restaurants.forEach(canteen => {
      const isOpen = isRestaurantOpen(canteen.name, timeData.day, timeData.hour, timeData.minute);
      if (!isOpen) return;

      if (canteen.waitTime < minWaitTime) {
        minWaitTime = canteen.waitTime;
        bestCanteen = canteen;
      }
    });

    if (bestCanteen) {
      bannerRecommendName.textContent = bestCanteen.name;
      bannerRecommendTime.textContent = bestCanteen.waitTime + " 分鐘";
      btnBannerGo.style.display = "";
      btnBannerGo.onclick = () => {
        routeEndNode.value = bestCanteen.name;
        routeCalculated = true;
        calculateRoutePlanner();
        switchTab("route");
      };
    } else {
      bannerRecommendName.textContent = "目前所有學餐皆非營業時段";
      bannerRecommendTime.textContent = "--";
      btnBannerGo.style.display = "none";
    }
  }

  // 重新整理 (資料維持固定)
  btnDashboardRefresh.addEventListener("click", () => {
    restaurants.forEach(r => {
      if (r.name === "麗宴精緻自助餐") { r.minQueue = 10; r.maxQueue = 20; }
      else if (r.name === "喜歡你飯捲年糕") { r.minQueue = 4; r.maxQueue = 8; }
      else if (r.name === "天津蔥抓餅") { r.minQueue = 2; r.maxQueue = 4; }
      else if (r.name === "摩斯漢堡") { r.minQueue = 8; r.maxQueue = 16; }
      else if (r.name === "宣坊泰式料理") { r.minQueue = 14; r.maxQueue = 22; }
    });

    calculateWaitTimes();

    const refreshIcon = btnDashboardRefresh.querySelector(".material-symbols-outlined");
    if (refreshIcon) {
      refreshIcon.classList.add("animate-spin");
      setTimeout(() => refreshIcon.classList.remove("animate-spin"), 500);
    }

    renderDashboardGrid();
    updateDashboardRecommendationBanner();
  });

  renderDashboardGrid();
  updateDashboardRecommendationBanner();

  // ==========================================
  // 6. Tab 2: 決策規劃 (智慧推薦)
  // ==========================================
  function calculateSmartRecommendations() {
    let endPreference = recommendCategorySelect.value;
    let isValid = false;
    if (recommendCategorySelect && recommendCategorySelect.options) {
      for (let i = 0; i < recommendCategorySelect.options.length; i++) {
        if (recommendCategorySelect.options[i].value === endPreference) {
          isValid = true;
          break;
        }
      }
    }
    if (!endPreference || !isValid) {
      endPreference = "none";
      recommendCategorySelect.value = "none";
    }
    const currentTimeStr = recommendTimeInput.value || "12:30";
    const maxWaitLimitVal = recommendMaxWaitInput.value.trim();
    const maxWaitLimit = maxWaitLimitVal !== "" ? parseInt(maxWaitLimitVal, 10) : Infinity;

    const timeData = getTaipeiDateTime();
    const day = timeData.day;
    let startHour = 12;
    let startMin = 30;
    if (currentTimeStr.includes(":")) {
      const parts = currentTimeStr.split(":");
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) {
        startHour = h;
        startMin = m;
      }
    }

    const candidates = [];
    const excludedList = [];

    restaurants.forEach(canteen => {
      const isOpen = isRestaurantOpen(canteen.name, day, startHour, startMin);
      const forecast = getSpreadsheetForecast(canteen.name, day, startHour, startMin);
      const waitTime = forecast.waitTime;
      
      const pathResult = findShortestPath(campusGraph, "第一教學大樓", "學生餐廳");
      const walkTime = googleMapsWalkTimes["第一教學大樓"] || Math.max(1, Math.round(pathResult.distance / 80));
      const totalTime = walkTime + waitTime;

      const mappedCategory = categoryMapping[canteen.type] || canteen.type;
      const categoryMatches = (endPreference === "none" || canteen.type === endPreference || mappedCategory === endPreference);
      const waitTimeComplies = (maxWaitLimitVal === "" || isNaN(maxWaitLimit) || waitTime <= maxWaitLimit);

      const item = {
        name: canteen.name,
        type: canteen.type,
        waitTime: waitTime,
        minQueue: forecast.minQueue,
        maxQueue: forecast.maxQueue,
        walkTime: walkTime,
        totalTime: totalTime,
        pathResult: pathResult,
        description: canteen.description || "",
        popularFood: canteen.popularFood || "",
        isOpen: isOpen
      };

      if (isOpen && categoryMatches && waitTimeComplies) {
        candidates.push(item);
      } else {
        excludedList.push(item);
      }
    });

    if (candidates.length === 0) {
      featuredChoiceContainer.classList.add("hidden");
      secondaryOptionsPanel.classList.add("hidden");
      notRecommendedPanel.classList.add("hidden");
      recommendReportCard.classList.add("hidden");
      
      const allClosed = restaurants.every(c => !isRestaurantOpen(c.name, day, startHour, startMin));
      if (allClosed) {
        recommendEmptyState.querySelector("h4").textContent = "目前選擇時段該學餐皆非營業時間";
        recommendEmptyState.querySelector("p").textContent = "所有學餐在該時段均未營業，請調整推薦時間。";
      } else {
        recommendEmptyState.querySelector("h4").textContent = "沒有符合您要求的學餐";
        recommendEmptyState.querySelector("p").textContent = "請放寬您的飲食類別偏好，或是增加可接受的最久等待時間限制。";
      }
      recommendEmptyState.classList.remove("hidden");
      return;
    }

    recommendEmptyState.classList.add("hidden");
    candidates.sort((a, b) => a.totalTime - b.totalTime);

    // Winner #1: 首選推薦
    const featured = candidates[0];
    featuredChoiceContainer.classList.remove("hidden");
    featuredChoiceContainer.onclick = null;
    
    const btnFeaturedDetail = document.getElementById("btn-featured-detail");
    const btnFeaturedRoute = document.getElementById("btn-featured-route");
    
    if (btnFeaturedDetail) {
      btnFeaturedDetail.onclick = (e) => {
        e.stopPropagation();
        openStoreModal(featured.name);
      };
    }
    if (btnFeaturedRoute) {
      btnFeaturedRoute.onclick = (e) => {
        e.stopPropagation();
        routeEndNode.value = featured.name;
        routeCalculated = true;
        calculateRoutePlanner();
        switchTab("route");
      };
    }
    
    const featuredConfig = storeDetailsConfig[featured.name] || {};
    featuredImg.src = featuredConfig.img || "data/cafeteria.png";
    featuredName.textContent = featured.name;
    featuredTotalTime.textContent = featured.totalTime;
    featuredWaitTime.textContent = featured.waitTime;
    featuredType.textContent = featured.type;

    featuredReasons.innerHTML = `
      <li class="flex items-start gap-sm">
        <span class="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
        <span>總耗時最短，包含步行 <b>${featured.walkTime}</b> 分鐘及店內等待 <b>${featured.waitTime}</b> 分鐘。</span>
      </li>
      <li class="flex items-start gap-sm">
        <span class="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
        <span>熱門精選：<b>${featured.popularFood}</b>。</span>
      </li>
    `;

    // 次要推薦
    secondaryOptionsPanel.innerHTML = "";
    const runners = candidates.slice(1, 3);
    if (runners.length > 0) {
      secondaryOptionsPanel.classList.remove("hidden");
      runners.forEach((r, idx) => {
        const choiceCard = document.createElement("div");
        choiceCard.className = "bg-surface-container-lowest p-md card-radius border border-outline-variant custom-shadow hover:bg-surface-container-low transition-colors group cursor-pointer";
        choiceCard.innerHTML = `
          <div class="flex justify-between items-start mb-md">
            <div>
              <span class="font-label-sm text-on-surface-variant opacity-60 mb-xs block">推薦排名 #${idx + 2}</span>
              <h4 class="font-headline-md text-headline-md text-on-surface font-bold">${r.name}</h4>
            </div>
            <div class="bg-primary/5 p-sm rounded-full text-primary shrink-0">
              <span class="material-symbols-outlined">restaurant_menu</span>
            </div>
          </div>
          <div class="flex gap-sm mb-md flex-wrap font-bold">
            <span class="font-body-md text-on-surface-variant flex items-center gap-xs">
              <span class="material-symbols-outlined text-[18px]">schedule</span> 總共 ${r.totalTime} 分鐘
            </span>
            <span class="font-body-md text-on-surface-variant flex items-center gap-xs">
              <span class="material-symbols-outlined text-[18px]">timer_10_alt_1</span> 等待 ${r.waitTime} 分鐘
            </span>
          </div>
          <p class="text-label-sm text-on-surface-variant italic mb-md">${r.description}</p>
          <div class="flex gap-2">
            <button class="flex-1 py-sm border border-primary text-primary pill-radius font-label-md hover:bg-primary hover:text-on-primary transition-all font-bold btn-detail">
              查看詳情
            </button>
            <button class="flex-1 py-sm bg-primary text-on-primary pill-radius font-label-md hover:opacity-90 transition-all font-bold btn-route">
              規劃路線
            </button>
          </div>
        `;
        
        const btnDetail = choiceCard.querySelector(".btn-detail");
        const btnRoute = choiceCard.querySelector(".btn-route");
        
        if (btnDetail) {
          btnDetail.addEventListener("click", (e) => {
            e.stopPropagation();
            openStoreModal(r.name);
          });
        }
        if (btnRoute) {
          btnRoute.addEventListener("click", (e) => {
            e.stopPropagation();
            routeEndNode.value = r.name;
            routeCalculated = true;
            calculateRoutePlanner();
            switchTab("route");
          });
        }
        
        choiceCard.addEventListener("click", () => openStoreModal(r.name));
        secondaryOptionsPanel.appendChild(choiceCard);
      });
    } else {
      secondaryOptionsPanel.classList.add("hidden");
    }

    // 較為擁擠或排除的名單
    notRecommendedPanel.innerHTML = "";
    const excludedCanteens = [...candidates.slice(3), ...excludedList];
    if (excludedCanteens.length > 0) {
      notRecommendedPanel.classList.remove("hidden");
      
      const subHeader = document.createElement("h4");
      subHeader.className = "font-label-md text-on-surface-variant opacity-70 ml-2 font-bold mb-2";
      subHeader.textContent = "其他選項 (較擁擠或不符偏好)";
      notRecommendedPanel.appendChild(subHeader);

      excludedCanteens.forEach(r => {
        const busyCard = document.createElement("div");
        busyCard.className = "bg-surface-container-high/50 p-md card-radius border border-outline-variant/50 border-dashed opacity-75 flex flex-col md:flex-row justify-between items-start md:items-center gap-md cursor-pointer hover:bg-surface-container-high transition-colors";
        
        let waitTimeText = `等待 ${r.waitTime} 分鐘 (總共 ${r.totalTime} 分鐘)`;
        let badgeContent = "";
        
        if (!r.isOpen) {
          waitTimeText = "目前非營業時段";
          badgeContent = `
            <div class="bg-error/10 border border-error/20 text-error px-md py-sm pill-radius font-bold text-label-md flex items-center gap-xs shrink-0">
              <span class="w-3 h-3 bg-error rounded-full"></span>
              🔴 非營業時段
            </div>
          `;
        } else {
          badgeContent = `
            <div class="bg-error/10 border border-error/20 text-error px-md py-sm pill-radius font-bold text-label-md flex items-center gap-xs shrink-0">
              <span class="w-3 h-3 bg-error rounded-full"></span>
              ${r.waitTime > 18 ? "🔴 目前較為擁擠" : "⚠️ 不符限制"}
            </div>
          `;
        }

        busyCard.innerHTML = `
          <div class="flex items-center gap-md">
            <div class="bg-surface-dim p-sm rounded-full text-on-surface-variant shrink-0">
              <span class="material-symbols-outlined">fastfood</span>
            </div>
            <div>
              <h4 class="font-headline-md text-headline-md text-on-surface-variant font-bold">${r.name}</h4>
              <p class="font-body-md text-on-surface-variant flex items-center gap-xs font-semibold">
                <span class="material-symbols-outlined text-[18px]">history</span> ${waitTimeText}
              </p>
            </div>
          </div>
          ${badgeContent}
        `;
        busyCard.addEventListener("click", () => openStoreModal(r.name));
        notRecommendedPanel.appendChild(busyCard);
      });
    } else {
      notRecommendedPanel.classList.add("hidden");
    }

    // 推薦報告
    recommendReportCard.classList.remove("hidden");
    repRecommendName.textContent = featured.name;
    repWaitTime.textContent = featured.waitTime + " 分鐘";

    const currentTotalMinutes = startHour * 60 + startMin;
    const arrivalTotalMinutes = currentTotalMinutes + featured.totalTime;
    const arrivalHour = Math.floor(arrivalTotalMinutes / 60) % 24;
    const arrivalMin = arrivalTotalMinutes % 60;
    const arrivalTimeStr = `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`;
    repFinishTime.textContent = arrivalTimeStr;
    repInfoAlert.textContent = `此餐廳符合您的時間需求，預期將於 ${arrivalTimeStr} 抵達並取得餐點。`;
  }

  btnRecommendSubmit.addEventListener("click", () => {
    const originalContent = btnRecommendSubmit.innerHTML;
    btnRecommendSubmit.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">autorenew</span> 計算中...';
    btnRecommendSubmit.disabled = true;

    setTimeout(() => {
      btnRecommendSubmit.innerHTML = originalContent;
      btnRecommendSubmit.disabled = false;
      calculateSmartRecommendations();
    }, 400);
  });

  // ==========================================
  // 7. Tab 3: 行程規劃 (地圖畫線與 GPS 定位防呆)
  // ==========================================
  function populateRouteSelectors() {
    routeStartNode.innerHTML = "";
    routeEndNode.innerHTML = "";

    const gpsOpt = document.createElement("option");
    gpsOpt.value = "gps";
    gpsOpt.textContent = "📍 GPS 目前位置";
    routeStartNode.appendChild(gpsOpt);

    // 過濾起點 (教學大樓、出入口與運動場)，並排除學生宿舍、second_bld、網球場、籃球場、運動場
    const excludeList = ["學生宿舍", "second_bld", "網球場", "籃球場", "運動場"];
    const startOptions = Object.keys(campusNodes).filter(key => {
      const type = campusNodes[key].type;
      const isValid = type === "building" || type === "gate" || type === "sports";
      return isValid && !excludeList.includes(key);
    }).sort();

    const canteens = ["麗宴精緻自助餐", "喜歡你飯捲年糕", "天津蔥抓餅", "摩斯漢堡", "宣坊泰式料理"];

    startOptions.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      routeStartNode.appendChild(opt);
    });

    canteens.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      routeEndNode.appendChild(opt);
    });

    routeStartNode.value = "第一教學大樓";
    routeEndNode.value = "天津蔥抓餅";
  }

  function calculateRoutePlanner() {
    const start = routeStartNode.value;
    const end = routeEndNode.value;
    const canteen = restaurants.find(r => r.name === end);
    if (!canteen) return;

    const timeData = getTaipeiDateTime();
    const isOpen = isRestaurantOpen(canteen.name, timeData.day, timeData.hour, timeData.minute);

    let walkTime = 0;
    let waitTime = canteen.waitTime;

    let startLat = 25.0433;
    let startLng = 121.5345;

    if (start === "gps") {
      let coordsToUse = userCoords;
      if (!coordsToUse) {
        if (isUsingFallbackGps) {
          coordsToUse = { lat: 25.0425, lng: 121.5332 }; // NTUT 校內預設模擬點
        } else {
          triggerRouteGpsLocation(false);
          return;
        }
      }

      // GPS 距離防呆與 Snap 節點
      const distToCenter = calculateDistance(coordsToUse.lat, coordsToUse.lng, campusCenter[0], campusCenter[1]);
      let finalStartNode = "正校門";

      if (distToCenter > 500) {
        const isAlreadySnapped = (coordsToUse.lat === 25.042205042013688 && coordsToUse.lng === 121.53542339646548);
        if (!isAlreadySnapped) {
          alert("偵測到不在校園內 自動定位到正門口");
        }
        coordsToUse = { lat: 25.042205042013688, lng: 121.53542339646548 };
        userCoords = { lat: 25.042205042013688, lng: 121.53542339646548 };
        finalStartNode = "正校門";
        gpsRouteStatus.className = "text-xs font-semibold pl-2 mt-1 text-amber-600";
        gpsRouteStatus.textContent = "偵測到不在校園內 自動定位到正門口";
        gpsRouteStatus.classList.remove("hidden");
      } else {
        // 尋找最近的真實校園節點作為起點
        let minD = Infinity;
        campusGraph.nodes.forEach(node => {
          const c = campusNodes[node];
          if (c) {
            const d = calculateDistance(coordsToUse.lat, coordsToUse.lng, c.lat, c.lng);
            if (d < minD) {
              minD = d;
              finalStartNode = node;
            }
          }
        });
        gpsRouteStatus.className = "text-xs font-semibold pl-2 mt-1 text-green-600";
        gpsRouteStatus.textContent = `📍 定位成功！最接近之節點：${finalStartNode}`;
        gpsRouteStatus.classList.remove("hidden");
      }

      startLat = coordsToUse.lat;
      startLng = coordsToUse.lng;

      const pathResult = findShortestPath(campusGraph, finalStartNode, "學生餐廳");
      walkTime = googleMapsWalkTimes[finalStartNode] || Math.max(1, Math.round(pathResult.distance / 80));

    } else {
      gpsRouteStatus.classList.add("hidden");
      const node = campusNodes[start];
      if (node) {
        startLat = node.lat;
        startLng = node.lng;
      }

      const pathResult = findShortestPath(campusGraph, start, "學生餐廳");
      walkTime = googleMapsWalkTimes[start] || Math.max(1, Math.round(pathResult.distance / 80));
    }

    // Update KPIs depending on whether routing has been officially requested
    if (!routeCalculated) {
      kpiWalkTime.textContent = "    分鐘";
      kpiWaitTime.textContent = "    分鐘";
      kpiTotalTime.textContent = "    分鐘";
      kpiStatusBadge.className = "inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fcf9f5] text-primary border border-outline-variant";
      kpiStatusBadge.textContent = "等待計算";
    } else {
      kpiWalkTime.textContent = walkTime + " 分鐘";
      if (!isOpen) {
        kpiWaitTime.textContent = "非營業";
        kpiTotalTime.textContent = "非營業";
        kpiStatusBadge.className = "inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30";
        kpiStatusBadge.textContent = "🔴 目前非營業時段";
      } else {
        const totalTime = walkTime + waitTime;
        kpiWaitTime.textContent = waitTime + " 分鐘";
        kpiTotalTime.textContent = totalTime + " 分鐘";
        updateKpiBadge(totalTime);
      }
    }

    // Update embedded Google Maps iframe to show directions
    const destLat = 25.044027973087083;
    const destLng = 121.53328789865442;
    const mapIframe = document.getElementById("map-iframe");
    if (mapIframe) {
      let startLabel = start;
      if (start === "gps") {
        const distToCenter = calculateDistance(startLat, startLng, campusCenter[0], campusCenter[1]);
        if (distToCenter > 500 || (startLat === 25.042205042013688 && startLng === 121.53542339646548)) {
          startLabel = "正校門";
        } else {
          startLabel = "我的位置";
        }
      }
      mapIframe.src = `https://maps.google.com/maps?saddr=${startLat},${startLng}+(${encodeURIComponent(startLabel)})&daddr=${destLat},${destLng}+(${encodeURIComponent("學生餐廳")})&dirflg=w&output=embed`;
    }

    // Faster canteen recommendation logic
    let betterChoice = null;
    let maxSavings = 0;
    const currentTotal = walkTime + waitTime;

    if (isOpen) {
      restaurants.forEach(otherCanteen => {
        if (otherCanteen.name === end) return;
        const otherOpen = isRestaurantOpen(otherCanteen.name, timeData.day, timeData.hour, timeData.minute);
        if (!otherOpen) return;
        
        let otherWalk = walkTime; 
        const otherTotal = otherWalk + otherCanteen.waitTime;
        const savings = currentTotal - otherTotal;

        if (savings > maxSavings) {
          maxSavings = savings;
          betterChoice = {
            name: otherCanteen.name,
            walkTime: otherWalk,
            waitTime: otherCanteen.waitTime,
            totalTime: otherTotal,
            savings: savings
          };
        }
      });
    }

    if (betterChoice && maxSavings >= 2) {
      routeBetterChoiceCard.classList.remove("hidden");
      betterCanteenName.textContent = betterChoice.name;
      betterWalkTime.textContent = betterChoice.walkTime;
      betterWaitTime.textContent = betterChoice.waitTime;
      betterTotalTime.textContent = betterChoice.totalTime;
      betterSavings.textContent = betterChoice.savings;
    } else {
      routeBetterChoiceCard.classList.add("hidden");
    }
  }

  function updateKpiBadge(totalTime) {
    if (totalTime <= 15) {
      kpiStatusBadge.className = "inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      kpiStatusBadge.textContent = "🟢 人潮少 (0-15 分鐘)";
    } else if (totalTime <= 25) {
      kpiStatusBadge.className = "inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      kpiStatusBadge.textContent = "🟡 普通 (16-25 分鐘)";
    } else {
      kpiStatusBadge.className = "inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30";
      kpiStatusBadge.textContent = "🔴 擁擠 (25+ 分鐘)";
    }
  }

  // HTML5 Geolocation API
  function triggerRouteGpsLocation(shouldOpenModalAfter = false) {
    userCoords = null;
    isUsingFallbackGps = false;

    gpsRouteStatus.classList.remove("hidden");
    gpsRouteStatus.textContent = "正在獲取 GPS 定位...";
    gpsRouteStatus.className = "text-xs font-semibold pl-2 mt-1 text-amber-600 animate-pulse";
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        isUsingFallbackGps = false;
        
        gpsRouteStatus.textContent = "📍 GPS 定位成功！";
        gpsRouteStatus.className = "text-xs font-semibold pl-2 mt-1 text-green-600";
        routeStartNode.value = "gps";
        
        if (shouldOpenModalAfter) {
          triggerMapNavigationModal();
        } else {
          calculateRoutePlanner();
        }
      },
      (error) => {
        console.warn("GPS failed, using NTUT center fallback:", error);
        const simulateOutside = confirm("無法獲取真實 GPS 定位 (通常為瀏覽器本機 file:// 載入的安全限制)。\n\n是否模擬「校園外部定位」以測試「偵測到不在校園內 自動定位到正門口」之功能？\n\n[確定]：模擬校外定位 (台北車站)\n[取消]：模擬校內定位 (設計館)");
        
        if (simulateOutside) {
          userCoords = { lat: 25.0462, lng: 121.5176 }; // 台北車站 (校外)
          gpsRouteStatus.textContent = "📍 定位模擬中 (模擬校外定位)";
        } else {
          userCoords = { lat: 25.0419, lng: 121.5332 }; // 設計館 (校內)
          gpsRouteStatus.textContent = "📍 定位模擬中 (使用校園預設點)";
        }
        isUsingFallbackGps = true;
        gpsRouteStatus.className = "text-xs font-semibold pl-2 mt-1 text-green-600";
        routeStartNode.value = "gps";

        if (shouldOpenModalAfter) {
          triggerMapNavigationModal();
        } else {
          calculateRoutePlanner();
        }
      },
      { enableHighAccuracy: true, timeout: 4000 }
    );
  }

  btnGpsLocate.addEventListener("click", () => triggerRouteGpsLocation(false));

  btnRouteSwitchTarget.addEventListener("click", () => {
    routeEndNode.value = betterCanteenName.textContent;
    routeCalculated = true;
    calculateRoutePlanner();
  });

  routeStartNode.addEventListener("change", () => {
    if (routeStartNode.value === "gps") {
      triggerRouteGpsLocation(false);
    } else {
      gpsRouteStatus.classList.add("hidden");
      calculateRoutePlanner();
    }
  });

  routeEndNode.addEventListener("change", () => {
    calculateRoutePlanner();
  });

  // ==========================================
  // 8. Google Maps 導航整合與外部連結
  // ==========================================
  function openExternalGoogleMaps() {
    const start = routeStartNode.value;
    const end = routeEndNode.value;
    
    let startLat, startLng;
    if (start === "gps") {
      if (userCoords) {
        startLat = userCoords.lat;
        startLng = userCoords.lng;
      } else {
        startLat = 25.042205042013688;
        startLng = 121.53542339646548;
      }
    } else {
      const node = campusNodes[start];
      if (node) {
        startLat = node.lat;
        startLng = node.lng;
      } else {
        startLat = 25.0433;
        startLng = 121.5345;
      }
    }
    
    const destLat = 25.044027973087083;
    const destLng = 121.53328789865442;
    
    let startLabel = start;
    if (start === "gps") {
      const distToCenter = calculateDistance(startLat, startLng, campusCenter[0], campusCenter[1]);
      if (distToCenter > 500 || (startLat === 25.042205042013688 && startLng === 121.53542339646548)) {
        startLabel = "正校門";
      } else {
        startLabel = "我的位置";
      }
    }
    
    const url = `https://maps.google.com/maps?saddr=${startLat},${startLng}+(${encodeURIComponent(startLabel)})&daddr=${destLat},${destLng}+(${encodeURIComponent("學生餐廳")})&dirflg=w`;
    window.open(url, "_blank");
  }

  btnRouteSubmit.addEventListener("click", () => {
    const originalContent = btnRouteSubmit.innerHTML;
    btnRouteSubmit.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">autorenew</span> 規劃中...';
    btnRouteSubmit.disabled = true;

    setTimeout(() => {
      btnRouteSubmit.innerHTML = originalContent;
      btnRouteSubmit.disabled = false;
      
      routeCalculated = true;
      calculateRoutePlanner();
    }, 450);
  });

  const btnOpenExternalMaps = document.getElementById("btn-open-external-maps");
  if (btnOpenExternalMaps) {
    btnOpenExternalMaps.addEventListener("click", openExternalGoogleMaps);
  }

  populateRouteSelectors();

  // ==========================================
  // 9. Canteen Details Modal Management
  // ==========================================
  function openStoreModal(storeName) {
    const details = storeDetailsConfig[storeName];
    const canteen = restaurants.find(r => r.name === storeName);
    if (!details || !canteen) return;

    const timeData = getTaipeiDateTime();
    const isOpen = isRestaurantOpen(canteen.name, timeData.day, timeData.hour, timeData.minute);

    modalTitle.textContent = storeName;
    modalImg.src = details.img;

    const modalMenuTitle = document.getElementById("modal-menu-title");
    if (modalMenuTitle) {
      modalMenuTitle.textContent = canteen.name === "麗宴精緻自助餐" ? "今日推薦菜色" : "熱門精選餐點";
    }

    if (canteen.name === "麗宴精緻自助餐") {
      const buffetDishes = ["高麗菜", "櫛瓜", "炸湯圓", "炸地瓜", "糖醋排骨"];
      const selectedDishes = buffetDishes.sort(() => 0.5 - Math.random()).slice(0, 3);
      modalMenu.innerHTML = selectedDishes.map(dish => `
        <li class="flex justify-between items-center p-2 bg-surface-container-low dark:bg-[#3d3d3d] rounded-lg font-bold text-sm text-[#1c1c1a] dark:text-[#fcf9f5] border border-outline-variant/10">
          <span>${dish}</span>
          <span class="text-primary dark:text-[#fecb9b]">今日推薦</span>
        </li>
      `).join("");
    } else {
      modalMenu.innerHTML = details.menu.map(dish => {
        const parts = dish.split(" ($");
        const name = parts[0];
        const price = parts[1] ? "$" + parts[1].replace(")", "") : "";
        return `
          <li class="flex justify-between items-center p-2 bg-surface-container-low dark:bg-[#3d3d3d] rounded-lg font-bold text-sm text-[#1c1c1a] dark:text-[#fcf9f5] border border-outline-variant/10">
            <span>${name}</span>
            <span class="text-primary dark:text-[#fecb9b]">${price}</span>
          </li>
        `;
      }).join("");
    }

    if (!isOpen) {
      modalWait.textContent = "目前非營業時段";
      modalQueue.textContent = "--";
      modalAiReport.className = `p-md rounded-xl bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30`;
      modalAiReport.innerHTML = `
        <p class="font-bold mb-1">🔴 目前非營業時段</p>
        <p class="text-sm font-semibold">該學餐目前不在營業時間內，請於營業時段內再來訪。</p>
      `;
    } else {
      modalWait.textContent = canteen.waitTime + " 分鐘";
      const currentQueue = Math.round((canteen.minQueue + canteen.maxQueue) / 2);
      modalQueue.textContent = `${currentQueue} 人`;
      const aiReport = getDynamicAiReport(canteen.name, canteen.waitTime);
      modalAiReport.className = `p-md rounded-xl ${aiReport.aiClass}`;
      modalAiReport.innerHTML = `
        <p class="font-bold mb-1">${aiReport.aiStatus}</p>
        <p class="text-sm font-semibold">${aiReport.aiText}</p>
      `;
    }

    const btnModalActionRoute = document.getElementById("btn-modal-action-route");
    if (btnModalActionRoute) {
      btnModalActionRoute.onclick = () => {
        routeEndNode.value = storeName;
        routeCalculated = true;
        calculateRoutePlanner();
        switchTab("route");
        closeStoreModal();
      };
    }

    btnModalActionRecommend.onclick = () => {
      // Check if canteen.type matches any option value. If not, default to "none"
      let hasOption = false;
      const mappedType = categoryMapping[canteen.type] || canteen.type;
      if (recommendCategorySelect && recommendCategorySelect.options) {
        for (let i = 0; i < recommendCategorySelect.options.length; i++) {
          if (recommendCategorySelect.options[i].value === mappedType || recommendCategorySelect.options[i].value === canteen.type) {
            recommendCategorySelect.value = recommendCategorySelect.options[i].value;
            hasOption = true;
            break;
          }
        }
      }
      if (!hasOption) {
        recommendCategorySelect.value = "none";
      }
      recommendMaxWaitInput.value = "";
      closeStoreModal();
      switchTab("recommend");
    };

    storeModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeStoreModal() {
    storeModal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  btnCloseModal.addEventListener("click", closeStoreModal);
  btnModalCloseFallback.addEventListener("click", closeStoreModal);
  modalOverlay.addEventListener("click", closeStoreModal);

  switchTab("dashboard");
});
