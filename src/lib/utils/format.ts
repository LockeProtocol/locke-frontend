import { DateTime, Duration } from 'luxon'

export function format(n: number): string {
    if (isNaN(n)) return '--'
    if (n == 0) return n.toFixed(2)
    let negative = n < 0
    n = Math.abs(n)
    let decimals = Math.max(2, Math.floor(Math.log10(n)) * -1 + 1)
    return `${negative ? '-' : ''}${n.toFixed(decimals)}`
}

export function formatAddress(address: string) {
    const str1 = String(address).slice(2, 4).toUpperCase();
    const str2 = String(address).slice(address.length - 4, address.length).toUpperCase();
    return `0x${str1}…${str2}`;
}

export function roundBN(bn: string) {
    return format(parseFloat(bn))
}

export function formatDate(unixTimestamp) {
    return DateTime.fromSeconds(unixTimestamp)
        .toLocaleString(DateTime.DATETIME_SHORT)
}

const units = [
    'year',
    'month',
    'week',
    'day',
    'hour',
    'minute',
    'second',
  ];
  
export function humanDuration(duration: Duration) {
    const diff = duration.shiftTo(...units);
    const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';
    return Duration.fromObject({[unit]: Math.trunc(duration.as(unit))}).toHuman()
}

export default {
    format: format,
    formatDate: formatDate
}