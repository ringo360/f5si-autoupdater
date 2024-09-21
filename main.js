import consola from 'consola'
import color from 'picocolors'
import config from './config.json'


//?              ms * sec
const Interval = 1000 * 60

async function lookup(domain) {
	try {
		const addr = (await dns.lookup(domain)).address;
		return {
			success: true,
			ipaddr: addr
		}
	} catch {
		console.log(`${domain}: Name or service not known`);
		return {
			success: false,
			ipaddr: null
		}
	}
}

async function UpdateDDNS() {
	//
}

async function CheckIPAddr() {
	const res = await fetch("http://httpbin.org/ip");
	const data = await res.json();
	return data.origin;
}

async function main() {
	setInterval(async () => {
		const DNS_IPAddr = await lookup(config.domain)
		if (DNS_IPAddr.success) {
			const Curr_IPAddr = await CheckIPAddr()

		} else {
			consola.warn('[DNS-Lookup] Failed to fetch IP Address.')
		}
		
	}, Interval);
}