// Strips secret fields from anything we are about to send to a client.
// Works on Prisma results (plain objects / arrays, arbitrarily nested via `include`).
const SENSITIVE_KEYS = new Set(['password', 'otp', 'otpExpiration']);

function sanitize(value, seen = new WeakMap()) {
    if (value === null || value === undefined || typeof value !== 'object') {
        return value;
    }
    // Dates (and other non-plain objects such as Buffers or Prisma Decimals)
    // are returned untouched so their JSON serialisation is preserved.
    if (value instanceof Date) {
        return value;
    }
    if (seen.has(value)) {
        return seen.get(value);
    }
    if (Array.isArray(value)) {
        const out = [];
        seen.set(value, out);
        for (const item of value) {
            out.push(sanitize(item, seen));
        }
        return out;
    }
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
        return value;
    }
    const out = {};
    seen.set(value, out);
    for (const [key, val] of Object.entries(value)) {
        if (SENSITIVE_KEYS.has(key)) continue;
        out[key] = sanitize(val, seen);
    }
    return out;
}

module.exports = { sanitize, SENSITIVE_KEYS };
