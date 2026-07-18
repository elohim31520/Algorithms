interface ResilientTask {
    id: number;
    // 執行任務時，會傳入一個 signal，請確保內部的 fetch 有帶上這個 signal
    handler: (signal: AbortSignal) => Promise<any>;
}

/**
 * 題目一：帶有即時容錯中斷機制的並行限制器 (Resilient Concurrency Controller with Failure Threshold)
業務情境
你正在開發一個批次資料同步工具，需要發送 100 個 API 請求來同步資料。
為了保護頻寬，你使用 limit 來限制最大並行請求數。

然而，如果後端服務此時正在發生大面積崩潰（例如資料庫掛了，所有請求都回傳 500），繼續傻傻地把剩下的 80 幾個請求發完只是徒增伺服器負擔，且浪費前端資源。

因此，直屬主管要求你實作一個「即時容錯中斷機制」：

維持同時間最多執行 limit 個任務。

一旦「累計失敗的任務數量」達到 maxFailures，必須立刻中斷（Abort）所有「正在執行中」的請求，並且「不再啟動」任何尚未開始的任務，最後讓整個函式立即拋出 Error。

為了真正釋放瀏覽器與伺服器資源，你必須將 AbortSignal 傳入任務中，以便在觸發中斷時，真正掐斷（Cancel） 那些還在 Pending 的 Fetch 請求。
 */

/**
 * @param tasks 任務陣列
 * @param limit 最大並行數
 * @param maxFailures 容許的最大失敗次數。一旦【累計失敗次數 >= maxFailures】，立即中止所有任務並拋出錯誤。
 * @returns 成功時，回傳與 tasks 順序一致的結果陣列
 */
async function resilientConcurrencyLimit(
    tasks: ResilientTask[],
    limit: number,
    maxFailures: number
): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const n = tasks.length
        if (n === 0) return resolve([])

        const result = new Array(n)
        const activeControllerMap = new Map<number, AbortController>()

        let index = 0
        let errorCount = 0
        let completedCount = 0
        let isAbort = false

        const triggerGlobalAbort = (reason: string) => {
            if (isAbort) return
            isAbort = true

            for (const controller of activeControllerMap.values()) {
                controller?.abort()
            }

            activeControllerMap.clear();

            reject(new Error(reason));
        }

        const work = async () => {
            while (index < n && !isAbort) {
                const currentIndex = index++
                const task = tasks[currentIndex]
                const controller = new AbortController()
                activeControllerMap.set(currentIndex, controller)

                try {
                    const res = await task.handler(controller.signal)

                    if (isAbort) return
                    result[currentIndex] = res
                } catch (error) {
                    if (isAbort) return
                    errorCount++
                    result[currentIndex] = error

                    if (errorCount >= maxFailures) {
                        triggerGlobalAbort("Batch aborted due to excessive failures");
                        return;
                    }
                } finally {
                    activeControllerMap.delete(currentIndex);
                }

                completedCount++
                if (completedCount === n && !isAbort) {
                    resolve(result);
                }
            }
        }

        const actualLimit = Math.min(n, limit)
        for (let i = 0; i < actualLimit; i++) {
            work()
        }
    })
}


/**
 * 題目一：權重訊號量 (Weighted Async Semaphore)
 * 業務情境：
 * 你的伺服器記憶體總共只有 100MB。任務 A 需要 50MB，任務 B 需要 70MB。
 * 當 A 正在執行時，B 必須排隊。如果 A 結束釋放了空間，B 才能進場。
 */
class WeightedSemaphore {
    private currentPermits: number;
    private queue: { weight: number; resolve: (release: () => void) => void }[] = [];

    constructor(private maxPermits: number) {
        this.currentPermits = maxPermits;
    }

    /**
     * @param weight 該任務需要的權重點數
     * @returns 回傳一個 release 函式
     */
    async acquire(weight: number): Promise<() => void> {
        if (weight > this.maxPermits) {
            throw new Error(`weight ${weight} exceeds maxPermits ${this.maxPermits}`);
        }
        return new Promise((resolve) => {
            if (weight <= this.currentPermits) {
                this.currentPermits -= weight
                return resolve(this.release(weight))
            }
            this.queue.push({ weight, resolve })
        })
    }

    private release(weight: number): () => void {
        return () => {
            this.currentPermits += weight
            this.processQueue()
        }
    }

    private processQueue() {
        while (this.queue.length > 0) {
            const next = this.queue[0]
            if (next.weight > this.currentPermits) {
                break
            }
            this.queue.shift()
            this.currentPermits -= next.weight
            next.resolve(this.release(next.weight))
        }
    }
}