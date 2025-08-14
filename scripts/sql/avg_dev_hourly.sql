WITH RankedData AS (
    SELECT
        id,
        symbol,
        price,
        ⁠ change ⁠,
        DATE_FORMAT(created_at, '%Y-%m-%d %H') AS createdAtHour, -- 更名為 createdAtHour 避免混淆
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY symbol, DATE_FORMAT(created_at, '%Y-%m-%d %H')
            ORDER BY ⁠ change ⁠ DESC, created_at DESC
        ) as rn
    FROM
        market_index
    WHERE
        created_at >= '2025-07-11 17:12:59'
),
HourlyMaxChange AS (
    SELECT
        symbol,
        price,
        ⁠ change ⁠,
        createdAtHour,
        created_at
    FROM
        RankedData
    WHERE
        rn = 1
),
MovingAverages AS (
    SELECT
        symbol,
        price,
        created_at,
        AVG(price) OVER (
            PARTITION BY symbol
            ORDER BY created_at
            RANGE BETWEEN INTERVAL 20 DAY PRECEDING AND CURRENT ROW
        ) AS avg21,
        STDDEV(price) OVER (
            PARTITION BY symbol
            ORDER BY created_at
            RANGE BETWEEN INTERVAL 20 DAY PRECEDING AND CURRENT ROW
        ) AS stddev21
    FROM
        market_index
    WHERE
        created_at >= '2025-07-11 17:12:59'
)
SELECT
    hmc.symbol,
    hmc.price,
    hmc.⁠ change ⁠,
    hmc.createdAtHour,
    ma.avg21,
    ma.stddev21
FROM
    HourlyMaxChange hmc
JOIN
    MovingAverages ma
ON
    hmc.symbol = ma.symbol AND hmc.created_at = ma.created_at
ORDER BY
    hmc.symbol, hmc.createdAtHour;