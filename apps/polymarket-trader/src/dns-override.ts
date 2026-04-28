/**
 * DNS override — some ISPs (e.g. Vivo Fibra) silently NXDOMAIN polymarket.com
 * and kalshi.com on their default resolvers. On Windows `dns.setServers()`
 * is ignored by `dns.lookup()` (the function undici/fetch uses), because
 * Windows routes `lookup` through the OS resolver. So we replace undici's
 * global dispatcher with one whose `connect.lookup` uses `dns.resolve4`.
 *
 * Import this module FIRST in every process entry point.
 * Set DNS_OVERRIDE=0 to disable (on a network with working DNS).
 */
import dns from 'dns';
import { Agent, setGlobalDispatcher } from 'undici';

if (process.env.DNS_OVERRIDE !== '0') {
  dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1', '8.8.4.4']);

  // Undici connect.lookup follows Node's dns.lookup API:
  //   (hostname, options, callback) → callback(err, address, family)
  // where options may have { family, all, hints, ... }.
  const customLookup = (hostname: string, options: any, callback: any): void => {
    // options can be a number (legacy family), object, or omitted (function)
    const cb = typeof options === 'function' ? options : callback;
    if (!cb) return;

    const finish = (err: NodeJS.ErrnoException | null, address?: string, family?: number) => {
      if (options && typeof options === 'object' && options.all) {
        if (err) return cb(err);
        return cb(null, [{ address: address!, family: family! }]);
      }
      cb(err, address, family);
    };

    dns.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        return finish(null, addresses[0], 4);
      }
      // Fallback: OS resolver (localhost, IPv6-only, .local…)
      dns.lookup(hostname, { family: 0 }, (e, address, family) => {
        if (e) return finish(e);
        finish(null, address, family);
      });
    });
  };

  setGlobalDispatcher(
    new Agent({
      connect: {
        lookup: customLookup,
      },
    })
  );
}
