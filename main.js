import consola from 'consola';
import color from 'picocolors';
import config from './config.json' assert { type: 'json' };
import dns from 'dns/promises';

//? must be in   ms * sec
const Interval = 1000 * 60;

async function lookup(domain) {
	try {
		const addr = (await dns.lookup(domain)).address;
		return {
			success: true,
			ipaddr: addr,
		};
	} catch {
		consola.fail(`${domain}: Name or service not known`);
		return {
			success: false,
			ipaddr: null,
		};
	}
}

async function UpdateDDNS(domain, token, ipaddr) {
	const res = await fetch(`https://f5.si/update.php?domain=${domain}&password=${token}&ip=${ipaddr}&format=json`);
	const data = await res.json();
	if (data.result === 'OK') {
		return true;
	} else if (data.result === 'NG') {
		throw new Error(`Bad Request. ([${data.errorcode}] ${data.errormsg})`);
	} else {
		throw new Error(`Failed to request to f5.si.\nResponse json:\n` + data);
	}
}

async function CheckIPAddr() {
	const res = await fetch('http://httpbin.org/ip');
	const data = await res.json();
	return data.origin;
}

async function Checker() {
	const start_pf = performance.now();
	consola.info('Checking DNS Record...');
	const DNS_IPAddr = await lookup(config.domain + '.f5.si');
	consola.info('Checking Current IP Address...');
	const Curr_IPAddr = await CheckIPAddr();
	if (DNS_IPAddr.success) {
		if (DNS_IPAddr.ipaddr !== Curr_IPAddr) {
			consola.info('Updating DNS...');
			try {
				await UpdateDDNS(config.domain, config.token, Curr_IPAddr);
				consola.success(`Updated in ${(performance.now() - start_pf).toFixed(2)}ms.`);
			} catch (e) {
				consola.error(e);
				consola.fail(`Failed in ${(performance.now() - start_pf).toFixed(2)}ms.`);
				return;
			}
		} else {
			consola.success('Already Updated.');
		}
	} else {
		consola.warn('[DNS-Lookup] Failed to fetch IP Address.');
		consola.fail(`Failed in ${(performance.now() - start_pf).toFixed(2)}ms.`);
		return;
	}
}

async function main() {
	await Checker();
	setInterval(await Checker, Interval);
}

main();
