import consola from 'consola';
import color from 'picocolors';
import config from './config.json' assert { type: 'json' };

//? must be in   ms * sec
const Interval = 1000 * 30;

async function lookup(domain) {
	try {
		const addr = (await dns.lookup(domain)).address;
		return {
			success: true,
			ipaddr: addr,
		};
	} catch {
		console.log(`${domain}: Name or service not known`);
		return {
			success: false,
			ipaddr: null,
		};
	}
}

async function UpdateDDNS(domain, token, ipaddr) {
	const res = (await fetch(`https://f5.si/update.php?domain=${domain}&password=${token}&ip=${ipaddr}&format=json`)).json();
	if (res.result === 'OK') {
		return true;
	} else if (res.result === 'NG') {
		throw new Error(`Bad Request. ([${res.errorcode}] ${res.errormsg})`);
	} else {
		throw new Error(`Failed to request to f5.si.\nResponse json:\n${res}`);
	}
}

async function CheckIPAddr() {
	const res = (await fetch('http://httpbin.org/ip')).json();
	return res.origin;
}

async function main() {
	setInterval(async () => {
		const start_pf = performance.now();
		consola.info('Checking DNS Record...');
		const DNS_IPAddr = await lookup(config.domain + '.f5.si');
		if (DNS_IPAddr.success) {
			consola.info('Checking Current IP Address...');
			const Curr_IPAddr = await CheckIPAddr();
			if (DNS_IPAddr.ipaddr !== Curr_IPAddr) {
				consola.info('Updating DNS...');
				try {
					await UpdateDDNS(config.domain, config.token, Curr_IPAddr);
					consola.success(`Succeeded in ${(performance.now() - start_pf).toFixed(2)}ms.`);
				} catch (e) {
					consola.error(e);
				}
			}
		} else {
			consola.warn('[DNS-Lookup] Failed to fetch IP Address.');
		}
	}, Interval);
}
