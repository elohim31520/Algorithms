const {
	// Import all the functions to be tested
	getCurrentDateTime,
	getCurrentDate,
	getCurrentTime,
	subtractMonths,
	subtractDays,
	Countdown,
	isBetween,
	formatDate,
	formatTimeAgo,
	normalizeDate,
	createZonedDateFromInput,
	getZonedDate,
	getZonedYear,
	createZonedDate,
	getCurrentDateTimeForFilename,
	fileNameToDateTimeString,
	dateTimeStringToFileName,
	zhTimeStringToStandard,
	getMonthList,
	parseChineseDate,
	parseUtcDateTimeString,
	getStartOfToday,
	getEndOfToday,
} = require('../modules/date')

function runDateTests() {
	console.log('--- 測試 date.ts 模組 ---')
	console.log('============================\n')

	// --- 基本時間獲取 ---
	console.log('** 1. 基本時間獲取 **')
	console.log(`getCurrentDateTime(): `, getCurrentDateTime())
	console.log(`getCurrentDate():     `, getCurrentDate())
	console.log(`getCurrentTime():     `, getCurrentTime())
	console.log(`getZonedYear():       `, getZonedYear())
	console.log(`getZonedDate():       `, getZonedDate())
	console.log(`new Date():           `, new Date())
	console.log('----------------------------\n')

	// --- 日期格式化 ---
	console.log('** 2. 日期格式化 **')
	const now = getZonedDate()
	console.log(`formatDate(now):                             `, formatDate(now))
	console.log(
		`formatDate(now, 'yyyy-MM-dd HH:mm:ss'):      `,
		formatDate(now, 'yyyy-MM-dd HH:mm:ss')
	)
	const fiveDaysAgo = subtractDays(now, 5)
	console.log(`formatTimeAgo (5天前):                      `, formatTimeAgo(fiveDaysAgo))
	console.log('----------------------------\n')

	// --- 日期解析與正規化 ---
	console.log('** 3. 日期解析與正規化 **')
	const dateString1 = '2023-10-27 10:30:00'
	const dateString2 = '2023/10/27'
	const dateString3 = '2025-07-10 07:20'
	const timestamp = 1698399000000 // 2023-10-27 10:30:00 UTC
	const zhDateString = '2023 年 07 月 26 日 9:45'
	const utcDateString = '2023-10-27 15:45'

	console.log(`normalizeDate('${dateString1}'):    `, normalizeDate(dateString1))
	console.log(`normalizeDate('${dateString2}'):        `, normalizeDate(dateString2))
	console.log(`normalizeDate(timestamp):                  `, normalizeDate(timestamp))
	console.log(`normalizeDate('${dateString3}'):    `, normalizeDate(dateString3))
	console.log(
		`zhTimeStringToStandard('${zhDateString}'): `,
		zhTimeStringToStandard(zhDateString)
	)
	console.log(
		`parseUtcDateTimeString('${utcDateString}', 'yyyy-MM-dd HH:mm'):`,
		parseUtcDateTimeString(utcDateString, 'yyyy-MM-dd HH:mm')
	)
	console.log('----------------------------\n')

	// --- 日期比較與計算 ---
	console.log('** 4. 日期比較與計算 **')
	const startOfDay = getStartOfToday()
	const endOfDay = getEndOfToday()
	console.log(`getStartOfToday(): `, startOfDay)
	console.log(`getEndOfToday():   `, endOfDay)
	console.log(`isBetween(now, startOfDay, endOfDay): `, isBetween(startOfDay, endOfDay))
	const futureDate = subtractDays(now, -5)
	console.log(
		`isBetween(now, futureDate, endOfDay): `,
		isBetween(futureDate, endOfDay)
	)
	console.log(`subtractDays(now, 7): `, subtractDays(now, 7))
	console.log(`subtractMonths(now, 2): `, subtractMonths(now, 2))
	console.log('----------------------------\n')

	// --- Countdown Class ---
	console.log('** 5. Countdown Class **')
	const deadlineDate = new Date()
	deadlineDate.setSeconds(deadlineDate.getSeconds() + 5)
	const deadlineString = formatDate(deadlineDate, 'yyyy-MM-dd HH:mm:ss')
	const countdown = new Countdown(deadlineString)
	console.log(`Countdown for 5 seconds...`)
	console.log(`- get() 1: `, countdown.get())
	setTimeout(() => {
		console.log(`- get() 2 (after 2s): `, countdown.get())
	}, 2000)
	console.log('----------------------------\n')
}

runDateTests()
