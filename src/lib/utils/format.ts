import { DateTime } from 'luxon'

export function format(n: number): string {
    if (isNaN(n)) return '--'
    if (n == 0) return n.toFixed(2)
    let decimals = Math.max(2, Math.floor(Math.log10(n)) * -1 + 1)
    return n.toFixed(decimals)
}


export function formatDate(unixTimestamp) {
    return DateTime.fromSeconds(unixTimestamp)
        .toLocaleString(DateTime.DATETIME_SHORT)
}

export default {
    format: format,
    formatDate: formatDate
}