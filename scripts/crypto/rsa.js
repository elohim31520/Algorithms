const crypto = require('crypto');

function rsaSignVerify(message) {
    console.log('\n--- 練習題 3：RSA 金鑰對生成與使用 ---');

    // 1. 生成 RSA 金鑰對
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // 金鑰長度
        publicKeyEncoding: {
            type: 'spki', // 標準格式
            format: 'pem' // PEM 編碼
        },
        privateKeyEncoding: {
            type: 'pkcs8', // 標準格式
            format: 'pem' // PEM 編碼
            // cipher: 'aes-256-cbc', // 如果需要加密私鑰
            // passphrase: 'your_strong_password' // 加密私鑰的密碼
        }
    });

    console.log('生成公鑰:\n', publicKey);
    console.log('生成私鑰:\n', privateKey);

    // 2. 使用私鑰簽署訊息
    const sign = crypto.createSign('sha256');
    sign.update(message);
    const signature = sign.sign(privateKey, 'hex');

    console.log('原始訊息:', message);
    console.log('數位簽章 (Hex):', signature);

    // 3. 使用公鑰驗證簽章
    const verify = crypto.createVerify('sha256');
    verify.update(message);
    const isVerified = verify.verify(publicKey, signature, 'hex');

    console.log('簽章驗證結果 (原始訊息):', isVerified ? '成功' : '失敗');

    // 4. 嘗試修改訊息並驗證 (應失敗)
    const tamperedMessage = `這是一段需要被數位簽章的訊息。Ａ＿Ａ`
    const verifyTampered = crypto.createVerify('sha256');
    verifyTampered.update(tamperedMessage);
    const isTamperedVerified = verifyTampered.verify(publicKey, signature, 'hex');

    console.log('簽章驗證結果 (篡改訊息):', isTamperedVerified);
}

rsaSignVerify('這是一段需要被數位簽章的訊息。');