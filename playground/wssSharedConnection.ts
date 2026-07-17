/**
 *  每個分頁每 2 秒檢查一次「目前 Leader 是否還活著」(心跳是否在 3 秒內更新過)。
    若 Leader 心跳過期(或根本沒有 Leader)→ 發起「搶旗」流程,選出新 Leader。
    搶到的分頁把自己的 tabId 寫進 localStorage,並開始定期(每 1 秒)更新心跳。
    Leader 建立真正的 WebSocket,收到訊息後透過 BroadcastChannel 廣播給其他分頁(Follower)。
    Follower 監聽廣播,收到資料就交給使用者的 callback 處理。
 */
interface SharedWSOptions {
    /** 收到 WebSocket 訊息時的回呼函式 */
    onMessage?: (data: string) => void
    /** 連線狀態改變時的回呼函式 */
    onStatusChange?: (status: 'CONNECTED' | 'DISCONNECTED') => void
}

interface ChannelMessage {
    type: 'WS_DATA' | 'CLIENT_SEND';
    payload?: string
}

function createSharedWS (wsUrl: string, options: SharedWSOptions){
    const tabId = 'tab_' + Math.random().toString(36).substring(2, 11);
    const channel = new BroadcastChannel('ws_shared_channel')

    let isLeader = false
    let ws: WebSocket | null = null
    let heartBeatTimer: ReturnType<typeof setInterval> | null = null
    let checkTimer: ReturnType<typeof setInterval> | null = null


    async function runElection (){
        const delay = Math.random() * 300
        await new Promise((resolve) => setTimeout(resolve, delay))

        // 如果有leader
        const lastHeartbeatTime = localStorage.getItem('heart_beat')
        if ((Date.now() - Number(lastHeartbeatTime)) < 3000) return //被搶先

        // 沒有就搶
        localStorage.setItem('leader_id', tabId)
        localStorage.setItem('heart_beat', Date.now().toString())

        // 二次確認
        await new Promise((resolve) => setTimeout(resolve, 50))
        const currentId = localStorage.setItem('leader_id')
        if (currentId === tabId) {
            promoteToLeader()
        }
    }

    function checkElection(){
        const currentLeader = localStorage.getItem('leader_id')
        const timestamp = localStorage.getItem('heart_beat')
        const isHeartBeatValid = (Date.now() - Number(timestamp)) < 3000

        if (currentLeader === tabId) return

        // 分裂腦(split-brain)情況。 心跳有效、而且 Leader 不是我,但我以為自己是 Leader
        if (isHeartBeatValid && currentLeader){
            if (isLeader) demoteToFollower()
        } else {
            runElection()
        }
    }

    function promoteToLeader (){
        isLeader = true
        localStorage.setItem('leader_id', tabId)

        ws = new WebSocket(wsUrl)

        ws.addEventListener("open", (event) => {
            console.log("連線成功！");
          });
          
        ws.addEventListener("message", (event) => {
            console.log("收到訊息：", event.data);
            const dataStr = typeof event.data === 'string' ? event.data : JSON.stringify(event.data)
            options.onMessage(dataStr) //給自己
            channel.postMessage({type: 'WS_DATA', payload: dataStr}) //分發給子頁
        });
        
        ws.addEventListener("error", (event) => {
            console.error("發生錯誤");

            if (localStorage.getItem('leader_id') === tabId) {
                localStorage.removeItem('leader_id')
                localStorage.removeItem('heart_beat')
            }
            // 主動讓位
            demoteToFollower()
        });
        
        ws.addEventListener("close", (event) => {
            console.log("連線關閉");
        });

        heartBeatTimer = setInterval(() => {
           localStorage.setItem('leader_id', tabId)
           localStorage.setItem('heart_beat', Date.now().toString())
        }, 1000)

    }

    function demoteToFollower (){
        isLeader = false

        if (heartBeatTimer){
            clearInterval(heartBeatTimer)
            heartBeatTimer= null
        }

        if (ws){
            ws.close()
            ws = null
        }
    }

    function handleMessage (message: ChannelMessage){
        if (isLeader && message.type === 'CLIENT_SEND'){
            // 我是 leader,收到 follower 委託我發送的訊息
            if (ws?.readyState === WebSocket.OPEN) {
                ws.send(message.payload!)
            }
        } else if (!isLeader && message.type === 'WS_DATA') {
            // 我是 follower,收到 leader 廣播的伺服器資料
            options.onMessage(message.payload)
        }
    }

    function handleBeforeUnload (){
        if (checkTimer){
            clearInterval(checkTimer)
            checkTimer = null
        }

        if (isLeader){
            localStorage.removeItem('leader_id')
            localStorage.removeItem('heart_beat')
            ws.close()
            ws = null
        }

        channel.close()
    }

    const init = () => {
        channel.onmessage = (event) => {
            handleMessage(event.data)
        }

        checkTimer = setInterval(checkElection, 2000)
        checkElection()

        window.addEventListener('beforeunload', handleBeforeUnload)
    } 

    init()

    // 對外接口
    function send (){
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(msg);
        } else {
            console.error("連線尚未建立或已關閉，無法發送訊息！");
        }
    }

    function destroy (){
        if (checkTimer) clearInterval(checkTimer);
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (isLeader && ws) ws.close();
        channel.close();

    }

    return {send, destroy}
}