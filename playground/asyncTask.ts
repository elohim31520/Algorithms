/**
 * @param {Function[]} tasks - 一個函式陣列，每個函式執行後都會回傳 Promise
 * @param {number} limit - 最大同時執行的任務數量
 * @returns {Promise<any[]>} - 包含所有任務結果的陣列，順序必須與 tasks 一致
 */
async function limitConcurrentRequests(tasks, limit) {
    let currentIndex = 0
    const res = Array.from({ length: tasks.length })

    async function work(): Promise<void> {
        while (currentIndex < tasks.length) {
            const taskIndex = currentIndex++
            const task = tasks[taskIndex]
            try {
                const response = await task()
                res[taskIndex] = response
            } catch (error) {
                res[taskIndex] = error
            }
        }
    }

    const actualLimit = Math.min(limit, tasks.length)
    const worker: Promise<void>[] = []
    for (let i = 0; i < actualLimit; i++) {
        worker.push(work())
    }

    await Promise.all(worker)
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
    const { timeout, maxRetries } = options
    let retryCount: number = 0
    let lastError
    while (retryCount <= maxRetries) {
        const controller = new AbortController()
        const timeId = setTimeout(() => {
            controller.abort()
        }, timeout)
        try {
            const response = await fetch(url, { signal: controller.signal })
            clearTimeout(timeId)
            return await response.json()
        } catch (error) {
            lastError = error
            retryCount++
            clearTimeout(timeId)

            if (retryCount > maxRetries) break;

            const waitTime = 1000 * Math.pow(2, retryCount - 1)
            await new Promise(rs => setTimeout(rs, waitTime))
        }
    }

    return Promise.reject(lastError)
}

/**
 * 題目三：自動完成搜尋框的防競態元件 (Autocomplete Race Condition)
    業務情境
    使用者在搜尋框快速輸入 "ap" 接著輸入 "apple"。

    13:00:00.100 發出 "ap" 的關鍵字請求（請求 A）

    13:00:00.200 發出 "apple" 的關鍵字請求（請求 B）
    因為網路波動，請求 B 在 13:00:00.400 就先回傳了，畫面渲染了 apple 的搜尋結果；但較慢的請求 A 卻在 13:00:00.600 才回傳。導致畫面最後被舊資料 "ap" 的結果覆蓋，造成嚴重的 UI Bug。

    題目要求
    請設計一個 SearchManager 類別（Class），解決前端這個經典的競態條件問題。

    規則細節
    當 search() 被連續呼叫時，只要有新的搜尋啟動，前一次尚未完成的請求必須立刻被 Abort 掉，確保永遠只有最後一次的請求會生效。

    被 Abort 的舊請求，其產生的 AbortError 必須在類別內部被妥善捕捉（catch），不要讓它變成全域的未捕獲異常（Uncaught Exception），但同時要確保外部呼叫 search 的地方不會收到錯誤的舊資料。
 */

class SearchManager {
    private controller
    constructor() {
        this.controller = null
    }

    /**
     * @param {string} keyword - 搜尋關鍵字
     * @returns {Promise<any>} - 該次搜尋的結果
     */
    async search(keyword) {
        if (this.controller) {
            this.controller.abort()
        }

        const controller = new AbortController()
        this.controller = controller

        const url = `?keyword=${encodeURIComponent(keyword)}`

        try {
            const response = await fetch(url, { signal: controller.signal })
            return await response.json()
        } catch (error) {
            throw error
        } finally {
            if (this.controller === controller) {
                this.controller = null;
            }
        }

    }
}

/**
    題目四：前端請求合併器 (Request Collapsing / Deduplicator)
    業務情境
    在一個複雜的儀表板頁面中，同時有 5 個不同的 UI 元件（側邊欄、大頭貼、問候語、設定頁面、購物車）在同一瞬間啟動。它們都需要呼叫 fetchUserProfile() 來獲取目前登入會員的資料。

    如果沒有優化，頁面一重整，瀏覽器會同時發出 5 個完全一模一樣的 HTTP 請求去敲後端 API。這不僅浪費頻寬，也會對資料庫造成無謂的壓力。
 */

class RequestDeduplicator {
    private map: Map<string, Promise<any>>
    constructor() {
        this.map = new Map<string, Promise<any>>()
    }

    /**
     * @param {string} url - 請求的 key/url
     * @param {Function} fetcher - 真正執行網路請求並回傳 Promise 的函式
     * @returns {Promise<any>}
     */
    async request<T>(url: string, fetcher: () => Promise<T>): Promise<T> {
        if (this.map.has(url)) {
            return this.map.get(url) as Promise<T>
        }

        const promise = fetcher().finally(() => this.map.delete(url))
        this.map.set(url, promise)

        return promise
    }
}


/**
    題目五：非同步任務排隊佇列 (Sequential Async Queue)
    業務情境
    你正在開發一個雲端筆記軟體（類似 Notion 或 Google Docs）。使用者在鍵盤上瘋狂打字，你的系統會在使用者停頓或發送自動存檔請求（saveToServer(content)）。

    因為網路波動，使用者在 13:00:01 發送的「舊草稿 A」比在 13:00:02 發送的「新內文 B」還要晚抵達伺服器。結果伺服器的最終資料被較晚送達的「舊草稿 A」給覆蓋了。

    為了解決這個嚴重的同步問題，你需要確保前端發送存檔請求時，不論呼叫頻率有多快，前一個存檔請求完全結束之前，下一個存檔請求絕對不能啟動，必須乖乖在佇列（Queue）中排隊。

    題目要求
    請實作一個 AsyncQueue 類別，確保任務嚴格按照「先進先出（FIFO）」的順序、序列化（一個接一個）地執行。
 */
class AsyncQueue {
    private queue
    private isPending: boolean

    constructor() {
        // 請在此初始化你的佇列或 Promise 鏈
        this.queue = []
        this.isPending = false
    }

    /**
     * 將非同步任務推入佇列，並回傳一個 Promise 以便讓呼叫端得知該任務何時完成
     * @param {Function} task - 一個回傳 Promise 的非同步函式
     * @returns {Promise<any>} - 該任務真正執行完畢後的結果
     */
    enqueue<T>(task: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ resolve, reject, task })
            this.work()
        })
    }

    async work(): Promise<void> {
        if (this.isPending) return

        while (this.queue.length) {
            const { resolve, reject, task } = this.queue.shift()
            this.isPending = true

            try {
                const response = await task()
                resolve(response)
            } catch (error) {
                reject(error)
            } finally {
                this.isPending = false
            }
        }
    }
}

interface BatchTask {
    id: number
    resolve: (value: any) => void
    reject: (value: any) => void
}

class RequestBatcher {
    /**
     * @param batchFetcher - 真正執行批次請求的函式。
     * 範例：輸入 [1, 2]，會回傳 Promise<['User1', 'User2']> (順序需與輸入 ids 一致)
     */

    private queue: BatchTask[] = []
    private hasScheduled = false
    constructor(private batchFetcher: (ids: number[]) => Promise<any[]>) {

    }

    /**
     * 外部元件呼叫的單一讀取函式
     * @param id 使用者 ID
     * @returns 該單一使用者的資料 Promise
     */
    public async load(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queue.push({ resolve, reject, id })

            if (!this.hasScheduled) {
                this.hasScheduled = true

                setTimeout(() => this.flushBatch(), 0)
            }
        })

    }

    private async flushBatch() {
        const batchTasks = this.queue
        this.queue = []
        this.hasScheduled = false

        if (!batchTasks.length) return
        const ids = batchTasks.map(vo => vo.id)

        try {
            const response = await this.batchFetcher(ids)
            batchTasks.forEach(({ resolve }, index) => {
                resolve(response[index])
            });
        } catch (error) {
            batchTasks.forEach(({ reject }) => {
                reject(error)
            })
        }
    }
}


const batcher = new RequestBatcher(async (ids) => {
    console.log('真實發送了批次網路請求，IDs:', ids); // 這行應該只會印出一次！
    return ids.map(id => `User_Data_${id}`);
});

// 同時觸發三次 load
Promise.all([
    batcher.load(1),
    batcher.load(2),
    batcher.load(3)
]).then(console.log);







type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface QueueItem {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    task: () => Promise<any>;
}

class PriorityAsyncQueue {
    private hq: QueueItem[] = []
    private mq: QueueItem[] = []
    private lq: QueueItem[] = []
    private isPending = false

    constructor() { }

    /**
     * 將任務推入佇列，並根據優先權決定排隊順序
     */
    public enqueue<T>(task: () => Promise<T>, priority: Priority = 'MEDIUM'): Promise<T> {
        return new Promise((resolve, reject) => {
            if (priority === 'HIGH') this.hq.push({ resolve, reject, task })
            else if (priority === 'MEDIUM') this.mq.push({ resolve, reject, task })
            else this.lq.push({ resolve, reject, task })

            if (!this.isPending) {
                this.isPending = true
                setTimeout(() => this.work(), 0)
            }
        })
    }

    private getTask(): QueueItem | undefined {
        return this.hq.shift() || this.mq.shift() || this.lq.shift()
    }

    private async work<T>(): Promise<void> {
        while (true) {
            const myTask = this.getTask()
            if (!myTask) {
                this.isPending = false
                return
            }
            try {
                const res = await myTask.task()
                myTask.resolve(res)
            } catch (error) {
                myTask.reject(error)
            }
        }
    }
}

type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
    private state: BreakerState = 'CLOSED';
    private failCount = 0
    private nextTryTime = 0

    constructor(
        private failureThreshold: number, // 最大連續失敗次數
        private recoveryTimeout: number    // 跳閘後冷卻時間（毫秒）
    ) { }

    /**
     * 包裝原本的非同步請求
     * @param action 真正執行網路請求的函式
     */
    public async execute<T>(action: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() > this.nextTryTime) {
                this.state = 'HALF_OPEN'

                // 💡 【核心優化】一決定進入 HALF_OPEN，立刻把下一次嘗試時間再往後推
                // 這樣在目前這個測試請求 await 結束前，其他併發進來的請求依然會被判定為 OPEN 而被攔截
                this.nextTryTime = Date.now() + this.recoveryTimeout;
            } else {
                throw new Error('API暫時不可用!')
            }
        }
        try {
            const response = await action()
            this.failCount = 0
            this.nextTryTime = 0
            this.state = 'CLOSED'
            return response
        } catch (error) {
            this.failCount++

            if (this.state === 'HALF_OPEN') {
                this.trip()
            }
            if (this.state === 'CLOSED' && this.failCount >= this.failureThreshold) {
                this.trip()
            }

            throw error
        }
    }

    private trip() {
        this.state = 'OPEN'
        this.nextTryTime = Date.now() + this.recoveryTimeout
    }
}


class RateLimiter {
    private tokens: number;
    private queue: (() => void)[] = []; // 儲存因為沒令牌而被阻塞的請求解鎖開關

    constructor(
        private maxTokens: number,      // 桶子最大容量
        private refillRate: number,     // 每次補充的令牌數量
        private refillInterval: number  // 補充令牌的間隔時間（毫秒）
    ) {
        this.tokens = maxTokens;
        this.startRefillTimer();
    }

    /**
     * 啟動自動定時補充令牌的計時器
     */
    private startRefillTimer(): void {
        setInterval(() => {
            this.tokens = Math.min(this.tokens + this.refillRate, this.maxTokens)
            while (this.queue.length && this.tokens >= 1) {
                const resolve = this.queue.shift()
                this.tokens--
                if (resolve) resolve()
            }
        }, this.refillInterval)
    }

    /**
     * 請求發送前呼叫此函式，若無令牌則會 await 阻塞，直到獲取令牌
     */
    public async acquire(): Promise<void> {
        if (this.tokens >= 1) {
            this.tokens--
            return
        }

        return new Promise(resolve => {
            this.queue.push(resolve)
        })
    }
}

const limiter = new RateLimiter(5, 1, 200); // 桶子最多 5 個，每 200ms 補 1 個

async function makeRequest(id: number) {
    await limiter.acquire(); // 拿不到令牌就會在這裡卡住排隊
    console.log(`[${new Date().toISOString()}] 請求 ${id} 正式發送`);
}

// 瞬間同時轟炸 10 個請求
for (let i = 1; i <= 10; i++) {
    makeRequest(i);
}


interface CacheEntry {
    data: any;
    fetchedAt: number; // 記錄這筆資料是什麼時候抓到的（Date.now()）
}


// 用最簡單的一句話直白來說：「有新的給新的，舊的過期先頂著用、背景偷偷換新的，什麼都沒有就大家一起等新的。」
class SWRCache {
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
        const cachedRecord = this.cache.get(key);
        const now = Date.now();

        // 時間內 直接給cache
        if (cachedRecord && now - cachedRecord.fetchedAt < this.ttl) {
            return cachedRecord.data
        }

        // 過期 
        if (cachedRecord) {
            // 上鎖 避免競爭 背景執行重取
            if (!this.pendingRequests.has(key)) {
                const bgPromise = fetcher().then(res => {
                    this.cache.set(key, {
                        data: res,
                        fetchedAt: Date.now()
                    })
                    return res
                }).finally(() => {
                    this.pendingRequests.delete(key)
                })
                this.pendingRequests.set(key, bgPromise)
            }
            // 馬上給
            return cachedRecord.data
        }

        // cache miss 重取 還要上鎖
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key)
        }

        const promise = fetcher().then(res => {
            this.cache.set(key, { data: res, fetchedAt: Date.now() })
            return res
        }).finally(() => {
            this.pendingRequests.delete(key)
        })

        this.pendingRequests.set(key, promise)

        return promise
    }
}



/**
     題型二：無情熔斷與超時重試 (Timeout & Retry Resilient Pool)實務情境： 
     串接 OpenAI API 時，有時因為網路波動，某個請求卡了 30 秒都沒回應（掛起），這會霸佔住珍貴的「櫃檯（Worker）位置」，導致後面的請求全卡死。
     面試官想挖的盲點： * 你懂不懂得用 Promise.race() 來幫非同步操作加上「超時（Timeout）機制」？當超時或失敗發生時，你能不能利用現代的 AbortController 
     真正把發出去的 Fetch 請求掐斷（Cancel），避免記憶體洩漏？你能不能實作失敗後自動重試（Retry）最多 $N$ 次，全部失敗才記錄錯誤？TypeScript 簽章定義：TypeScript// timeout: 單一請求超過 X 毫秒就判定失敗並中斷
    // retries: 失敗後最多可以嘗試的次數
    async function resilientPool(
        urls: string[], 
        limit: number, 
        timeout: number, 
        retries: number
    ): Promise<any[]> {
        // 你的解法...
    }
 */

async function resilientPool(
    urls: string[],
    limit: number,
    timeout: number,
    retries: number
): Promise<any[]> {
    let index = 0

    async function fetchWithRetry(taskIndex: number, retryCount: number): Promise<void> {
        const url = urls[taskIndex]
        const controller = new AbortController()

        // 超時 abort
        const timeId = setTimeout(() => {
            controller.abort()
        }, timeout)

        try {
            const response = await fetch(url, { signal: controller.signal })
            clearTimeout(timeId)

            res[taskIndex] = response
        } catch (error) {
            clearTimeout(timeId)

            const nextAttempt = retryCount + 1
            if (nextAttempt < retryCount) {
                fetchWithRetry(taskIndex, nextAttempt)
            } else {
                res[taskIndex] = error
            }

        }
    }

    async function work(): Promise<void> {
        while (index < urls.length) {
            const taskIndex = index++
            await fetchWithRetry(taskIndex, 0)
        }
    }

    const workers: Promise<any>[] = []
    for (let i = 0; i < limit; i++) {
        workers.push(work())
    }

    const res = await Promise.all(workers)
    return res
}

function flatten(arr) {
    const stack = [...arr]
    const res = []

    while (stack.length) {
        const cur = stack.pop()
        if (Array.isArray(cur)) {
            stack.push(...cur)
        } else {
            res.push(cur)
        }
    }

    return res.reverse()
}


/**
 * 題目十一：洋蔥模型非同步中間件組合器 (Async Middleware Composer / Onion Model)
業務情境
不論是 Node.js 的 Koa 框架，還是前端的 Redux 核心，都採用了經典的「洋蔥模型（Onion Model）」中間件（Middleware）機制。

當一個請求進來時，它會像穿過洋蔥一樣，依序穿過中間件 1、中間件 2，最後抵達核心邏輯；接著再反向依序穿過中間件 2、中間件 1 出去。這讓我們能在非同步請求的前後，優雅地插入權限驗證、Log 記錄、效能計時等功能。

題目要求
請實作一個 compose 函式，將一個非同步中間件陣列組合成一個單一的執行函式。

提示與邊界條件
思考如何利用遞迴（Recursion）或者將 Promise 串接起來，讓前一個中間件傳入的 next 函式，剛好包裝著下一個中間件的執行。

防呆機制：如果某個中間件在內部手殘呼叫了兩次 await next()，你的系統應該要能偵測到並拋出錯誤（Error('next() called multiple times')），防止非同步時序錯亂。

這兩題直接把非同步推向了「資料流控制」與「架構設計」的頂點。寫好後隨時貼上來，我們直接進入 Code Review 戰場！
 */


type NextFunction = () => Promise<void>;
type Middleware = (context: any, next: NextFunction) => Promise<void>;

function compose(middlewares: Middleware[]): (context: any) => Promise<void> {
    return function (context) {
        let lastIndex = -1

        function dispatch(index: number): Promise<void> {
            if (index <= lastIndex) {
                return Promise.reject('next() called multiple times')
            }

            const middleware = middlewares[index]
            if (!middleware) {
                return Promise.resolve()
            }

            try {
                const next: NextFunction = () => dispatch(index + 1)
                return Promise.resolve(middleware(context, next));
            } catch (error) {
                return Promise.reject(error);
            }
        }

        return dispatch(0)
    }
}

const middlewares: Middleware[] = [
    async (ctx, next) => {
        ctx.logs.push('1-Start');
        await next(); // 呼叫下一棒
        ctx.logs.push('1-End');
    },
    async (ctx, next) => {
        ctx.logs.push('2-Start');
        await next(); // 呼叫下一棒
        ctx.logs.push('2-End');
    },
    async (ctx, next) => {
        ctx.logs.push('Core-Logic');
        // 最後一棒不需要 next，或者 next 執行完什麼都不做
    }
];

const runner = compose(middlewares);
const context = { logs: [] };

runner(context).then(() => {
    console.log(context.logs);
    // 期待輸出完美的洋蔥圈順序：
    // ['1-Start', '2-Start', 'Core-Logic', '2-End', '1-End']
});


function debounce(func, delay) {
    let timer: ReturnType<typeof setTimeout> = null
    return function (...args) {
        if (timer) clearTimeout(timer)

        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}

function throttle(func, delay) {
    let lock = false
    return function (...args) {
        if (lock) return

        lock = true
        func.apply(this, args)

        setTimeout(() => {
            lock = false
        }, delay)
    }
}



/**
 * 在多執行緒語言中，為了防止多個線程同時修改同一個檔案或記憶體變數（導致 Race Condition），會使用「互斥鎖（Mutex）」。
 * 雖然 JavaScript 是單執行緒，但非同步操作（如 await readFile 到 await writeFile 之間）依然會被其他非同步任務插隊，進而導致資料被覆蓋。
 */

class Mutex {
    private isLocked = false;
    private queue: (() => void)[] = []; // 提示：儲存等待鎖釋放的 resolve 補給站

    /**
     * 獲取鎖。如果鎖被佔用，則會 await 阻塞，直到前一個人釋放鎖。
     * @returns 回傳一個用於解鎖的 release 函式
     */
    public async acquire(): Promise<() => void> {
        if (this.isLocked) {
            await new Promise<void>(rs => {
                this.queue.push(rs)
            })
        } else {
            this.isLocked = true
        }

        let released = false;
        const release = () => {
            if (released) return;
            released = true

            const next = this.queue.shift()
            if (next) next()
            else this.isLocked = false
        }
        return release
    }
}

const mutex = new Mutex();
let sharedResource = 0;

async function criticalSection(id: number) {
    const release = await mutex.acquire(); // 👈 在這裡排隊拿鎖

    console.log(`[任務 ${id}] 成功拿到了鎖，開始執行敏感操作...`);
    // 模擬耗時的非同步操作
    await new Promise(resolve => setTimeout(resolve, 500));
    sharedResource += 1;

    console.log(`[任務 ${id}] 操作結束，釋放鎖。`);
    release(); // 👈 核心：交出鑰匙，讓下一棒進來
}

// 同時轟炸三個任務
criticalSection(1);
criticalSection(2);
criticalSection(3);

// 期待行為：三個任務絕對不會交錯執行，而是會乖乖地每隔 500ms 依序「整套跑完」
// [任務 1] 成功拿到了鎖... -> (等500ms) -> [任務 1] 操作結束，釋放鎖。
// [任務 2] 成功拿到了鎖... -> (等500ms) -> [任務 2] 操作結束，釋放鎖。
// [任務 3] 成功拿到了鎖... -> (等500ms) -> [任務 3] 操作結束，釋放鎖。




/**
 * 標準的 Node.js EventEmitter 或瀏覽器的 addEventListener 都是同步觸發的。也就是說，當你 emit('save') 時，它只是把所有註冊的 listener 丟進去執行，並不會等待 listener 內部的 await 結束。

但在實務架構中（例如 Webpack 的外掛系統 Tapable、或是伺服器的生命周期鉤子 Hooks），我們希望讓外掛執行非同步操作（如優化圖片、檢查權限）。當發布事件時，系統必須一個接一個（串行 Sequential）等待每個外掛的 Promise 解析完成，才能往下走。
 */
type AsyncListener = (...args: any[]) => Promise<void>;

class AsyncEventEmitter {
    // 儲存事件名稱與對應的監聽器陣列
    private listenersMap = new Map<string, AsyncListener[]>();

    /**
     * 註冊事件監聽器
     */
    public on(event: string, listener: AsyncListener): void {
        if (!this.listenersMap.has(event)) {
            this.listenersMap.set(event, []);
        }
        this.listenersMap.get(event)!.push(listener);
    }

    /**
     * 觸發事件。
     * 核心要求：必須「依序 await」該事件底下的所有監聽器。
     * 前一個監聽器的 Promise 沒 resolve，絕對不能執行下一個。
     */
    public async emit(event: string, ...args: any[]): Promise<void> {
        const listeners = this.listenersMap.get(event)
        if (listeners) {
            for (const listener of listeners) {
                await listener(...args)
            }
        }
    }
}

const emitter = new AsyncEventEmitter();

emitter.on('upload', async (fileName) => {
    console.log(`[外掛 A] 開始優化 ${fileName}...`);
    await new Promise(r => setTimeout(r, 1000)); // 模擬耗時 1 秒
    console.log(`[外掛 A] 優化 ${fileName} 完成。`);
});

emitter.on('upload', async (fileName) => {
    console.log(`[外掛 B] 開始上傳 ${fileName} 到 AWS...`);
    await new Promise(r => setTimeout(r, 500));  // 模擬耗時 0.5 秒
    console.log(`[外掛 B] 上傳 ${fileName} 成功！`);
});

// 執行觸發
console.log('--- 觸發事件 ---');
emitter.emit('upload', 'video.mp4').then(() => {
    console.log('--- 所有非同步外掛全部嚴格依序執行完畢！ ---');
});

// 期待主控台輸出（時間軸必須完全對齊）：
// --- 觸發事件 ---
// [外掛 A] 開始優化 video.mp4...
// (嚴格等 1 秒後)
// [外掛 A] 優化 video.mp4 完成。
// [外掛 B] 開始上傳 video.mp4 到 AWS...
// (嚴格等 0.5 秒後)
// [外掛 B] 上傳 video.mp4 成功！
// --- 所有非同步外掛全部嚴格依序執行完畢！ ---


/**
 * 題目十四：非同步讀寫鎖 (Async Read-Write Lock / RWLock)
業務情境
在設計高併發的記憶體快取或小型的類資料庫結構時，我們常遇到這個情境：

讀取資料（Read）：是安全的，不論同時有多少人一起讀，都不會互相破壞資料。因此，多個讀取鎖可以同時並存。

寫入資料（Write）：是危險的。當有人在修改資料時，其他人既不能讀（會讀到髒資料），也不能寫（會覆蓋資料）。因此，寫入鎖必須是完全互斥且排他的。

如果用我們前面提到的標準 Mutex，會連讀取都一起阻擋，導致效能大幅下降。我們需要一個更聰明的「讀寫鎖」。

狀態機規則
多重讀取（Shared Read）：如果目前鎖被「讀取者」持有，新進來的「讀取請求」可以立刻獲取鎖（不阻塞），大家一起讀。

寫入互斥（Exclusive Write）：如果目前有任何一個人在讀（Read Count > 0）或有人在寫，新進來的「寫入請求」必須就地阻塞（await）。

讀寫互斥：如果目前有人正在寫，新進來的「讀取請求」也必須就地阻塞（await）。
 */

type WRItem {
    type: 'write' | 'read'
    resolve: () => void
}

class RWLock {
    private activeReaders = 0;
    private isWriting = false;
    private queue: WRItem[] = []

    private processQueue() {
        if (this.isWriting) return
        while (this.queue.length > 0) {
            const next = this.queue[0]
            if (next.type === 'write') {
                if (this.activeReaders === 0) {
                    this.queue.shift()
                    this.isWriting = true
                    next.resolve()
                }

                break //重點!
            } else {
                this.activeReaders++
                this.queue.shift()
                next.resolve()
            }
        }
    }

    /**
     * 獲取讀取鎖
     * @returns 用於釋放讀取鎖的 release 函式
     */
    public async acquireRead(): Promise<() => void> {
        await new Promise(resolve => {
            this.queue.push({ type: 'read', resolve })
            this.processQueue()
        })
        const release = () => {
            this.activeReaders--
            this.processQueue()
        }
        return release
    }

    /**
     * 獲取寫入鎖
     * @returns 用於釋放寫入鎖的 release 函式
     */
    public async acquireWrite(): Promise<() => void> {
        await new Promise(resolve => {
            this.queue.push({ type: 'write', resolve })
            this.processQueue()
        })
        const release = () => {
            this.isWriting = false
            this.processQueue()
        }
        return release
    }
}

const rwLock = new RWLock();

async function reader(id: number) {
    const release = await rwLock.acquireRead();
    console.log(`[Reader ${id}] 開始讀取...`);
    await new Promise(r => setTimeout(r, 300)); // 模擬讀取 300ms
    console.log(`[Reader ${id}] 讀取完畢。`);
    release();
}

async function writer(id: number) {
    const release = await rwLock.acquireWrite();
    console.log(`[Writer ${id}] 🛑 開始寫入關鍵資料...`);
    await new Promise(r => setTimeout(r, 500)); // 模擬寫入 500ms
    console.log(`[Writer ${id}] ✅ 寫入完畢。`);
    release();
}

// 測試轟炸時序
reader(1);
reader(2);       // 1 和 2 應該要能【同時】並行讀取
setTimeout(() => writer(1), 100);  // 100ms 後建立寫入請求，此時 1, 2 還在讀，寫入應該要【被阻塞】
setTimeout(() => reader(3), 200);  // 200ms 後建立讀取 3，但因為前面有人在排隊等寫入，為了防止寫入餓死，3 也應該【被阻塞】

// 期待輸出順序：
// [Reader 1] 開始讀取...
// [Reader 2] 開始讀取... （1和2同時在讀取中）
// [Reader 1] 讀取完畢。
// [Reader 2] 讀取完畢。 （當1和2都交出鑰匙後，寫入者終於醒來）
// [Writer 1] 🛑 開始寫入關鍵資料...
// [Writer 1] ✅ 寫入完畢。     （寫入者交出鑰匙後，遲到的Reader 3才醒來）
// [Reader 3] 開始讀取...
// [Reader 3] 讀取完畢。





/**
 * ### 第一題：具備逾時機制的 Promise (Promise Race)
**場景：** 在串接 API 時，如果請求時間過長，我們希望自動放棄該請求並拋出錯誤。

**要求：**
實作一個 `withTimeout<T>` 函式：
- 接收兩個參數：一個原有的 `Promise<T>` 以及逾時毫秒數 `ms`。
- 如果 `Promise` 在 `ms` 內完成，回傳其結果。
- 如果超過 `ms` 毫秒，則回傳一個 Reject，錯誤內容為 `"Request Timeout"`。

 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout>
    const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
            reject("Request Timeout")
        }, ms)
    })

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer))

}



/**
 * 第二題：非同步重試機制 (Async Retry)
    場景： 網路環境不穩定時，我們希望某些關鍵請求失敗後能自動重試。

    要求：
    實作一個 retryFetch<T> 函式：

    接收一個回傳 Promise 的函式 task: () => Promise<T>。

    接收一個重試次數 retries: number。

    如果 task 失敗，會自動重試，直到成功或達到重試次數上限。

    若最終仍失敗，拋出最後一次的錯誤。
 */

async function retryFetch<T>(task: () => Promise<T>, retries: number): Promise<T> {
    for (let retryCount = 1; retryCount <= retries; retryCount++) {
        try {
            const res = await task()
            return res
        } catch (error) {
            retryCount++
            if (retryCount === retries) {
                throw error
            }
            const waitTime = 1000 * retryCount * (2 ** (retryCount - 1))
            await new Promise(rs => setTimeout(rs, waitTime))
        }

    }
    throw new Error("Unexpected end of retryFetch");
}


/**
 * 第三題：實作簡單的併發限制器 (Concurrency Limit)
    場景： 假設你有 100 個圖片下載任務，但你希望瀏覽器同時「最多只能執行 3 個」任務，以避免記憶體溢出。

    要求：
    實作一個 concurrencyLimit 函式：

    接收一個非同步任務陣列 tasks: (() => Promise<any>)[]。

    接收一個最大併發數 limit: number。

    必須確保同一時間執行的任務數不超過 limit。

    回傳一個 Promise，其結果為所有任務完成後的結果陣列（順序需與 tasks 一致）。

 */


async function concurrencyLimitSettled<T>(
    tasks: (() => Promise<T>)[],
    limit: number
): Promise<PromiseSettledResult<T>[]> {

    const res: PromiseSettledResult<T>[] = new Array(tasks.length);
    let index = 0;

    const work = async () => {
        while (index < tasks.length) {
            const currentIndex = index++;
            const task = tasks[currentIndex];

            try {
                const value = await task();
                res[currentIndex] = { status: 'fulfilled', value };
            } catch (reason) {
                res[currentIndex] = { status: 'rejected', reason };
            }
        }
    };

    const workers: Promise<void>[] = [];
    const actualLimit = Math.min(limit, tasks.length);
    for (let i = 0; i < actualLimit; i++) {
        workers.push(work());
    }

    await Promise.all(workers);

    return res;
}