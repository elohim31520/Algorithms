async function limitConcurrency(urls: string[], limit: number): Promise<any[]> {
    const res = Array.from({ length: urls.length })
    let index: number = 0

    async function work() {
        while (index < urls.length) {
            const currentIndex = index++
            const url = urls[currentIndex]

            try {
                const response = await fetch(url)
                const data = await response.json()
                res[currentIndex] = data
            } catch (error) {
                res[currentIndex] = error
            }

        }
    }

    const worker: Promise<void>[] = []
    for (let i = 0; i < limit; i++) {
        worker.push(work())
    }

    await Promise.all(worker)
    return res
}



/**
實務情境： 公司的內部系統正在處理大量任務，此時直屬 CTO 突然插進來幾個緊急的 Ad-hoc 需求，系統必須在維持「同時間最多跑 3 個任務」的前提下，讓高優先權的任務「插隊」先執行。

面試官想挖的盲點： * 你還能不能用簡單的 index++ 這種線性指標？（答案是：不行，因為順序被打亂了）。

你如何讓多個 Worker 在變得有空時，動態去尋找目前「最緊急」的任務，而不是老老實實拿下一號？

TypeScript 簽章定義：
 */

interface AsyncTask {
    id: number;
    handler: () => Promise<any>; // 實際要執行的非同步函式
    priority: Priority;
}

// 傳入一個任務陣列，請確保高優先權（high > medium > low）的任務優先被 Worker 執行
async function priorityPool(tasks: AsyncTask[], limit: number): Promise<any[]> {

    const high_queue: AsyncTask[] = []
    const medium_queue: AsyncTask[] = []
    const low_queue: AsyncTask[] = []
    const res = Array.from({ length: tasks.length })

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i] as AsyncTask
        if (task.priority == 'high') {
            high_queue.push(task)
        } else if (task.priority == 'medium') {
            medium_queue.push(task)
        } else {
            low_queue.push(task)
        }
    }
    high_queue.reverse()
    medium_queue.reverse()
    low_queue.reverse()

    function getTask(): AsyncTask | undefined {
        return high_queue.pop() || medium_queue.pop() || low_queue.pop()
    }


    async function work() {
        while (true) {
            const task = getTask()
            if (!task) break
            try {
                const response = await task.handler()
                res[task.id] = response
            } catch (error) {
                res[task.id] = error
            }
        }
    }

    const worker: Promise<void>[] = []
    for (let i = 0; i < limit; i++) {
        worker.push(work())
    }

    await Promise.all(worker)
    return res
}


/**
* // limit: 同時執行的最大並行數 (e.g., 3)
// maxRequestsPerWindow: 在一個時間窗口內的最大發送總數 (e.g., 5)
// windowMs: 時間窗口長度 (e.g., 1000ms)
async function rateLimitedPool(
    urls: string[],
    limit: number,
    maxRequestsPerWindow: number,
    windowMs: number
): Promise<any[]> {
    // 你的解法...
}
*/

async function rateLimitedPool(
    urls: string[],
    limit: number,
    maxRequestsPerWindow: number,
    windowMs: number
): Promise<any[]> {

    let token: number = maxRequestsPerWindow
    let lastRefillTime: number = Date.now()
    const res = Array.from({ length: urls.length })
    const refillRate = maxRequestsPerWindow / windowMs

    async function bucketRefill(): Promise<void> {
        while (true) {
            const now = Date.now()
            const relapsed = now - lastRefillTime
            const tokenWillAdd = relapsed * refillRate

            if (tokenWillAdd > 0) {
                token += Math.min(tokenWillAdd, maxRequestsPerWindow)
                lastRefillTime = now
            }

            if (token >= 1) {
                token -= 1
                break
            }
            const waitForRefillBucket = (1 - token) / refillRate

            await new Promise(resolve => setTimeout(resolve, waitForRefillBucket))

        }
    }

    let currentIndex = 0
    async function work(): Promise<void> {
        while (currentIndex < urls.length) {
            const taskIndex = currentIndex++
            const url = urls[taskIndex]

            await bucketRefill()

            try {
                const response = await fetch(url)
                const data = await response.json()
                res[taskIndex] = data
            } catch (error) {
                res[taskIndex] = error
            }

        }
    }

    const worker: Promise<void>[] = []
    for (let i = 0; i < limit; i++) {
        worker.push(work())
    }
    await Promise.all(worker)

    return res
}


const departments = [
    { id: 3, name: '測試組', parentId: 2 },
    { id: 1, name: '總經理室', parentId: null },
    { id: 2, name: '研發部', parentId: 1 },
    { id: 4, name: '行銷部', parentId: 1 }
];

[
    {
        id: 1,
        name: '總經理室',
        parentId: null,
        children: [
            {
                id: 2,
                name: '研發部',
                parentId: 1,
                children: [
                    { id: 3, name: '測試組', parentId: 2, children: [] }
                ]
            },
            { id: 4, name: '行銷部', parentId: 1, children: [] }
        ]
    }
]

interface Department {
    id: number
    name: string
    parentId: number | null
}

interface DepartmentWithChildren extends Department {
    children: DepartmentWithChildren[]
}

function construct(departments: Department[]): DepartmentWithChildren[] {
    const map = new Map<number, DepartmentWithChildren>()
    const res: DepartmentWithChildren[] = []

    for (const dept of departments) {
        map.set(dept.id, { ...dept, children: [] });
    }

    for (let i = 0; i < departments.length; i++) {
        const id = departments[i].id
        const currentNode = map.get(id)
        if (!currentNode) continue;

        const pid = currentNode?.parentId

        if (pid === null || pid === undefined) {
            res.push(currentNode)
            continue
        }
        const parentNode = map.get(pid)
        if (parentNode) parentNode.children.push(currentNode)
    }

    return res
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
    const res = Array.from({ length: urls.length })

    const retry = async (currentIndex, retryCount) => {
        const controller = new AbortController()
        const timer = setTimeout(() => {
            controller.abort()
        }, timeout)
        try {
            const response = await fetch(urls[currentIndex], { signal: controller.signal })
            clearTimeout(timer)
            res[currentIndex] = response
        } catch (error) {
            clearTimeout(timer)
            if (retryCount >= retries) {
                res[currentIndex] = error
            } else {
                await retry(currentIndex, retryCount + 1)
            }

        }
    }

    const work = async () => {
        while (index < urls.length) {
            const currentIndex = index++
            await retry(currentIndex, 0)
        }

    }
    const workers: Promise<void>[] = []
    for (let i = 0; i < limit; i++) {
        workers.push(work())
    }

    await Promise.all(workers)

    return res
}