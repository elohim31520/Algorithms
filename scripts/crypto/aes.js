const crypto = require('crypto')

function aesEncryptDecrypt(text) {
	// 1. 定義演算法、金鑰和 IV
	try {
		const algorithm = 'aes-256-cbc'
		// 金鑰和 IV 應該是隨機生成的，這裡為了練習方便給出範例
		const key = crypto.randomBytes(32) // 256 位元 = 32 位元組
		const iv = crypto.randomBytes(16) // 128 位元 = 16 位元組

		// 2. 加密
		const cipher = crypto.createCipheriv(algorithm, key, iv)
		let encrypted = cipher.update(text, 'utf8', 'hex')
		encrypted += cipher.final('hex')

		// 3. 解密
		const decipher = crypto.createDecipheriv(algorithm, key, iv)
		let decrypted = decipher.update(encrypted, 'hex', 'utf8')
		decrypted += decipher.final('utf8')

		console.log('--- 練習題 1：對稱式加密 (AES) ---')
		console.log('原始文字:', text)
		console.log('密文 (Hex):', encrypted)
		console.log(encrypted.length)
		console.log('解密後文字:', decrypted)
		console.log('是否成功解密:', text === decrypted ? '是' : '否')
	} catch (error) {
		console.log(error)
	}
}

aesEncryptDecrypt('這是一段需要被 AES 加密和解密的秘密訊息！')
