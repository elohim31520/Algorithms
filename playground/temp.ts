// 原始資料
const menuItems = [
    { id: 1, name: '首頁', parentId: null },
    { id: 2, name: '系統設定', parentId: null },
    { id: 3, name: '帳號管理', parentId: 2 }, // 屬於系統設定
    { id: 4, name: '權限設定', parentId: 2 }  // 屬於系統設定
];

// 期待你輸出的結構
// [
//   { id: 1, name: '首頁', children: [] },
//   { id: 2, name: '系統設定', children: [ { id: 3, ... }, { id: 4, ... } ] }
// ]

interface Cascade {
    id: number
    name: string
    parentId: number | null
}

interface CascadeWithChildren extends Cascade {
    children: CascadeWithChildren[];
}


function flaten(lists: Cascade[]): CascadeWithChildren[] {
    const res: CascadeWithChildren[] = []
    let lookup: Record<number, CascadeWithChildren> = {}

    for (const element of lists) {
        const id = element.id
        lookup[id] = { ...element, children: [] }
    }

    for (const element of lists) {
        let pid = element.parentId
        let currentNode = lookup[element.id]
        if (!pid) {
            res.push(currentNode)
        } else {
            let parentNode = lookup[pid]
            if (parentNode) parentNode.children.push(currentNode)
        }
    }
    return res
}

/**
    題目二：具備超時與指數退避的可靠請求器 (Timeout & Exponential Backoff Retry)
    業務情境
    微服務架構中，串接第三方金流 API 時常因為網路波動遇到暫時性的 503 錯誤，或者請求直接掛起（Hang 住）沒有回應。為了提高系統的高可用性（High Availability），我們需要一個具備「自動超時中斷」與「漸進式重試」的請求機制。

    題目要求
    請實作一個 fetchWithRetryAndTimeout 函式。

    JavaScript

    規則細節
    超時控制： 如果單次請求超過 options.timeout 規定的時間（例如 3000ms）伺服器仍未回應，該次請求應被視為失敗，並主動中斷（Abort）該請求，避免佔用連線資源。

    指數退避（Exponential Backoff）： 當請求失敗或超時，不要立刻重試。重試的等待時間應該隨著失敗次數呈指數成長。

    第一次失敗後：等待 1000ms 再重試。

    第二次失敗後：等待 2000ms 再重試。

    第三次失敗後：等待 4000ms 再重試。（依此類推）

    如果重試次數達到 maxRetries 後依然失敗，拋出最終的錯誤。
 */

/**
 * @param {string} url - 請求的完整 URL
 * @param {Object} options 
 * @param {number} options.timeout - 單次請求的超時時間（毫秒）
 * @param {number} options.maxRetries - 最大重試次數
 * @returns {Promise<any>} - 最終的請求結果
 */
async function fetchWithRetryAndTimeout(url, options) {
    let retryCount = 0

    while (retryCount < options.maxRetries) {

        const controller = new AbortController()
        const timeID = setTimeout(() => {
            controller.abort()
        }, options.timeout)

        try {
            const res = await fetch(url, { signal: controller.signal })
            clearTimeout(timeID)

            if (!res.ok) throw new Error(`HTTP ERROR ${res.status}`)
            return res
        } catch (error) {
            clearTimeout(timeID)

            if (retryCount >= options.maxRetries) {
                throw error
            }
            retryCount++
            const waitTime = 1000 * Math.pow(2, retryCount - 1)
            await new Promise(rs => setTimeout(rs, waitTime))
        }
    }
}


interface CacheEntry {
    data: any;
    fetchedAt: number; // 記錄這筆資料是什麼時候抓到的（Date.now()）
}

// 用最簡單的一句話直白來說：「有新的給新的，舊的過期先頂著用、背景偷偷換新的，什麼都沒有就大家一起等新的。」

class SWRCache2 {
    private cache = new Map<string, CacheEntry>();
    private pendingRequests = new Map<string, Promise<any>>();

    constructor(
        private ttl: number // 快取的有效時間（毫秒），超過這個時間就被視為 Stale (過期)
    ) { }

    /**
     * 獲取資料的唯一接口
     * @param key 快取的鍵值 (例如 url)
     * @param fetcher 真正去網路抓資料的非同步函式
     */
    public async get(key: string, fetcher: () => Promise<any>): Promise<any> {
        if (this.cache.has(key)) {
            const cachedRecord = this.cache.get(key)
            const gap = Date.now() - cachedRecord!.fetchedAt
            if (gap > this.ttl) {
                // 有人拿就等 不要重複!
                if (!this.pendingRequests.has(key)) {
                    const bgPromise =
                        fetcher().then(res => {
                            const data = {
                                data: res,
                                fetchedAt: Date.now()
                            }
                            this.cache.set(key, data)
                            return data.data
                        }).catch(error => {
                            throw error
                        }).finally(() => {
                            this.pendingRequests.delete(key)
                        })
                    this.pendingRequests.set(key, bgPromise)
                }
            }

            return cachedRecord!.data
        }

        // 有人拿就等 不要重複!
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key)
        }

        const promise =
            fetcher().then(res => {
                const data = {
                    data: res,
                    fetchedAt: Date.now()
                }
                this.cache.set(key, data)
                return data.data
            }).catch(error => {
                throw error
            }).finally(() => {
                this.pendingRequests.delete(key)
            })

        this.pendingRequests.set(key, promise)
        return promise
    }
}


// 1. 狀態必須是全域共享的（不能放在函式內部）
const queue: (() => void)[] = [];
let tokens = 100;
const maxCapacity = 100;
const refillRate = 20; // 每秒 20 個
let lastRefillTime = Date.now();
let isProcessing = false; // 防止多個迴圈同時啟動


async function allowRequest(): Promise<void> {
    return new Promise<void>(rs => {
        queue.push(rs)
        processQueue()
    })
}

async function processQueue() {
    if (isProcessing) return
    isProcessing = true

    const milliRefill = refillRate / 1000

    while (queue.length > 0) {
        // 算時間差先補
        const now = Date.now()
        const gapSeconds = now - lastRefillTime
        const refill = gapSeconds * milliRefill
        tokens = Math.min(tokens + refill, maxCapacity)
        lastRefillTime = now

        if (tokens >= 1) {
            tokens--
            const nextReq = queue.shift()
            if (nextReq) nextReq()
        } else {
            // 不夠要再補
            const deltaTokens = 1 - tokens
            const waitTime = deltaTokens / milliRefill

            await new Promise(rs => setTimeout(rs, waitTime))
        }
    }

    // ✨ 【核心修正】隊列清空了，把工人的狀態重設，下次有新請求時才能再次啟動！
    isProcessing = false
}


class TokenBucket {
    private maxCapacity: number;   // 桶子最大容量 (B)
    private refillRate: number;    // 每秒流入速率 (R)
    private tokens: number;         // 當前剩餘令牌數
    private lastRefillTime: number; // 上一次充填（或請求）的時間戳記 (ms)

    constructor(B = 100, R = 20) {
        this.maxCapacity = B;
        this.refillRate = R;
        this.tokens = B;
        this.lastRefillTime = Date.now();
    }

    // 核心判斷方法：純同步計算，零定時器開銷
    public allowRequest(): boolean {
        const now = Date.now()
        const deltaTime = now - this.lastRefillTime
        const refillTokens = (deltaTime * this.refillRate) / 1000

        this.tokens = Math.min(this.tokens + refillTokens, this.maxCapacity)
        this.lastRefillTime = now

        if (this.tokens >= 1) {
            this.tokens--
            return true
        } else {
            return false
        }
    }
}


/**
    題目四：前端請求合併器 (Request Collapsing / Deduplicator)
    業務情境
    在一個複雜的儀表板頁面中，同時有 5 個不同的 UI 元件（側邊欄、大頭貼、問候語、設定頁面、購物車）在同一瞬間啟動。它們都需要呼叫 fetchUserProfile() 來獲取目前登入會員的資料。

    如果沒有優化，頁面一重整，瀏覽器會同時發出 5 個完全一模一樣的 HTTP 請求去敲後端 API。這不僅浪費頻寬，也會對資料庫造成無謂的壓力。
 */

class RequestDeduplicator2<T> {
    private map: Map<string, Promise<any>> = new Map();

    /**
     * @param {string} url - 請求的 key/url
     * @param {Function} fetcher - 真正執行網路請求並回傳 Promise 的函式
     * @returns {Promise<any>}
     */
    async request<T>(url: string, fetcher: () => Promise<T>): Promise<T> {
        if (this.map.has(url)) {
            return this.map.get(url) as Promise<T>
        }
        const promise = fetcher().finally(() => {
            this.map.delete(url)
        })
        this.map.set(url, promise)
        return promise
    }
}


//支援「強制更新」的請求合併器
class RequestDeduplicatorWithForce {
    private map: Map<string, Promise<any>> = new Map();

    /**
     * @param {string} url - 請求的 key/url
     * @param {Function} fetcher - 真正執行網路請求的函式
     * @param {Object} [options] - 設定選項
     * @param {boolean} [options.forceRefresh] - 是否強制重新整理
     */
    request<T>(
        url: string,
        fetcher: () => Promise<T>,
        options?: { forceRefresh?: boolean }
    ): Promise<T> {
        const forceRefresh = options?.forceRefresh ?? false;

        if (!forceRefresh && this.map.has(url)) return this.map.get(url) as Promise<T>
        const promise = fetcher().finally(() => this.map.delete(url))
        this.map.set(url, promise)
        return promise
    }
}



type BreakerState2 = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker2 {
    private state: BreakerState2 = 'CLOSED';
    private failCount: number = 0
    private nextTryTime: number = 0

    constructor(
        private failureThreshold: number, // 最大連續失敗次數
        private recoveryTimeout: number    // 跳閘後冷卻時間（毫秒）
    ) { }

    /**
     * 包裝原本的非同步請求
     * @param action 真正執行網路請求的函式
     */
    public async execute<T>(action: () => Promise<T>): Promise<T> {
        const now = Date.now()
        if (now < this.nextTryTime) return Promise.reject('熔斷中')

        if (this.state === 'OPEN') {
            this.state = 'HALF_OPEN'
            if (this.state === 'HALF_OPEN') {
                // 一個去試 ，其他擋掉
                this.nextTryTime = now + this.recoveryTimeout
            }
        }

        try {
            const res = await action()
            if (this.state === 'HALF_OPEN') {
                // 試成功 恢復
                this.state = 'CLOSED'
                this.nextTryTime = 0
            }
            this.failCount = 0
            return res
        } catch (error) {
            this.failCount++

            // 熔斷 | 半開失敗 再度熔斷
            if (this.failCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
                this.state = 'OPEN'
                this.nextTryTime = Date.now() + this.recoveryTimeout
            }

            // 修正點 2：把 throw error 移到 if 外面！
            // 不論有沒有觸發熔斷，這次請求真正的錯誤都必須拋給呼叫端知道
            throw error;
        }
    }
}