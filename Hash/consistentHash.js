const crypto = require('crypto');

class ConsistentHash {
    /**
     * @param {string[]} nodes - 初始的伺服器節點清單 (例如 ['Server_1', 'Server_2'])
     * @param {number} replicas - 每個實體節點要對應幾個虛擬節點 (預設 100)
     */
    constructor(nodes = [], replicas = 100) {
        this.replicas = replicas;
        this.ring = new Map(); // 儲存 Hash -> Node 的映射
        this.sortedKeys = [];  // 儲存排序後的 Hash 值，用於二分搜尋

        nodes.forEach(node => this.addNode(node));
    }

    // 將字串轉為數字 Hash (這裡使用 MD5 並取前 8 位轉 16 進位整數)
    _hash(key) {
        const hex = crypto.createHash('md5').update(key).digest('hex');
        return parseInt(hex.substring(0, 8), 16);
    }

    /**
     * 新增節點 (及其虛擬節點)
     */
    addNode(node) {
        for (let i = 0; i < this.replicas; i++) {
            // 虛擬節點標籤範例: "Server_1#0", "Server_1#1"...
            const vNodeKey = `${node}#${i}`;
            const hash = this._hash(vNodeKey);
            this.ring.set(hash, node);
            this.sortedKeys.push(hash);
        }
        // 每次新增後重新排序 (確保二分搜尋有效)
        this.sortedKeys.sort((a, b) => a - b);
    }

    /**
     * 移除節點
     */
    removeNode(node) {
        for (let i = 0; i < this.replicas; i++) {
            const vNodeKey = `${node}#${i}`;
            const hash = this._hash(vNodeKey);
            this.ring.delete(hash);
        }
        this.sortedKeys = this.sortedKeys.filter(k => !Array.from(this.ring.keys()).includes(k));
        // 重新過濾並排序
        this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
    }

    /**
     * 核心邏輯：找出 Key 該歸屬哪個節點
     */
    getNode(key) {
        if (this.sortedKeys.length === 0) return null;

        const hash = this._hash(key);

        // 實作「順時針尋找」：找第一個大於等於 hash 的位置
        // 這裡為了清楚用簡單迴圈，實務上節點多時會用 Binary Search
        let targetHash = this.sortedKeys[0]; // 預設為第一個 (環狀繞回)

        for (let i = 0; i < this.sortedKeys.length; i++) {
            if (this.sortedKeys[i] >= hash) {
                targetHash = this.sortedKeys[i];
                break;
            }
        }

        return this.ring.get(targetHash);
    }
}

// --- 測試代碼 ---

const ch = new ConsistentHash(['Server_A', 'Server_B', 'Server_C']);

console.log('--- 初始分配 ---');
const testKeys = ['user_123', 'order_99', 'image_pdf', 'video_mp4'];
testKeys.forEach(k => console.log(`${k} -> ${ch.getNode(k)}`));

console.log('\n--- 新增 Server_D ---');
ch.addNode('Server_D');
testKeys.forEach(k => console.log(`${k} -> ${ch.getNode(k)}`));

console.log('\n--- 移除 Server_B ---');
ch.removeNode('Server_B');
testKeys.forEach(k => console.log(`${k} -> ${ch.getNode(k)}`));