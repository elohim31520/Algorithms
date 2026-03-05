type Listener = () => void;

class AutoPersistStore {
  private listeners: Listener[] = [];
  private saveTimeout: any = null;

  constructor(private storageKey: string) {}

  // 訂閱機制 (Pub/Sub 的簡化版)
  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  // 發布變動並執行持久化 (帶有防抖功能)
  notify() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    
    // 防抖：在最後一次修改後的 300ms 才執行寫入
    this.saveTimeout = setTimeout(() => {
      console.log(`[系統] 偵測到變動，正在自動存檔至 ${this.storageKey}...`);
      this.listeners.forEach(fn => fn());
    }, 300);
  }

  // 核心：遞迴 Proxy 建立器
  createProxy<T extends object>(raw: T): T {
    const self = this;

    return new Proxy(raw, {
      get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver);
        // 如果讀取的是物件，遞迴包裝 Proxy，實現深層監控
        if (res !== null && typeof res === 'object') {
          return self.createProxy(res);
        }
        return res;
      },
      set(target, key, value, receiver) {
        const oldValue = Reflect.get(target, key, receiver);
        const result = Reflect.set(target, key, value, receiver);

        // 只有在數值真的改變時才觸發通知
        if (oldValue !== value) {
          self.notify();
        }
        return result;
      }
    });
  }
}

// 我們的初始資料
const userData = {
  name: "Alex",
  settings: {
    theme: "dark",
    notifications: true
  },
  items: ["TypeScript", "Design Patterns"]
};

// 1. 初始化持久化器
const persistor = new AutoPersistStore("USER_SETTINGS");

// 2. 建立被監控的狀態 (Proxy)
const state = persistor.createProxy(userData);

// 3. 訂閱：當變動發生時，執行存檔
persistor.subscribe(() => {
  localStorage.setItem("USER_SETTINGS", JSON.stringify(state));
  console.log("✅ 存檔完成！");
});

// --- 測試操作 ---

// 修改第一層：觸發存檔
state.name = "Alex Chen";

// 修改深層物件：依然能觸發存檔 (歸功於遞迴 Proxy)
state.settings.theme = "light";

// 修改陣列：一樣有效！
state.items.push("Auto-Persistence");