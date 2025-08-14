SELECT
    id,
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
    symbol = 'BTCUSD'
ORDER BY
    symbol, created_at;