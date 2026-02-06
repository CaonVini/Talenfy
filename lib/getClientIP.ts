import { headers } from 'next/headers';

export async function getClientIP(): Promise<string> {
    const headerList = await headers();

    const forwardedFor = headerList.get('x-forwarded-for');
    if (forwardedFor) {
        const ips = forwardedFor.split(',').map(ip => ip.trim());
        if (ips.length > 0 && ips[0]) {
            return ips[0];
        }
    }

    const realIp = headerList.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}
