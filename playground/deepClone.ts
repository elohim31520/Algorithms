function deepClone<T>(target: T, map = new WeakMap()): T {
    if (target === null || typeof target !== 'object') {
        return target
    }

    if (map.has(target as object)) {
        return map.get(target as object)
    }

    if (target instanceof Date) {
        return new Date(target.getTime()) as unknown as T
    }

    if (target instanceof RegExp) {
        return new RegExp(target.source, target.flags) as unknown as T
    }

    if (target instanceof Map) {
        const result = new Map()
        map.set(target, result)
        target.forEach((value, key) => {
            result.set(
                deepClone(key, map),
                deepClone(value, map)
            )
        })

        return result as unknown as T
    }

    if (target instanceof Set) {
        const result = new Set()
        map.set(target, result)
        target.forEach((value) => {
            result.add(deepClone(value, map))
        })

        return result as unknown as T
    }

    const result: any = Array.isArray(target) ? [] : {}

    map.set(target as object, result)

    Reflect.ownKeys(target).forEach((key) => {
        result[key] = deepClone(target[key], map)
    })

    return result as T
}