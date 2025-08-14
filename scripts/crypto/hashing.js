const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const originalFilePath = path.join(__dirname, 'test_file.txt');
fs.writeFileSync(originalFilePath, '這些資料探討了主要科技公司Alphabet、Amazon、CrowdStrike和Microsoft的現況與未來展望');

function calculateFileHash(filePath) {
    const hash = crypto.createHash('sha256');
    const input = fs.readFileSync(filePath);
    hash.update(input);
    return hash.digest('hex');
}

console.log('\n--- 練習題 2：雜湊 (Hashing) ---');

// 1. 計算原始文件的雜湊值
const originalHash = calculateFileHash(originalFilePath);
console.log('原始文件雜湊值:', originalHash);

// 2. 模擬文件被修改
const modifiedFilePath = path.join(__dirname, 'test_file_modified.txt');
fs.writeFileSync(modifiedFilePath, '這些資料探討了主要科技公司Alphabet、Amazon、CrowdStrike和Microsoft的現況與未來展望\n');

// 3. 計算修改後文件的雜湊值
const modifiedHash = calculateFileHash(modifiedFilePath);
console.log('修改後文件雜湊值:', modifiedHash);

// 4. 驗證雜湊值是否不同
console.log('雜湊值相同？:', originalHash == modifiedHash);

// 清理測試文件
fs.unlinkSync(originalFilePath);
fs.unlinkSync(modifiedFilePath);