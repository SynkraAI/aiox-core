import '../src/dns-override.ts';

(async () => {
  try {
    const res = await fetch('https://gamma-api.polymarket.com/markets?active=true&limit=1');
    console.log('STATUS:', res.status);
    const body = await res.text();
    console.log('BODY-HEAD:', body.slice(0, 300));
  } catch (e: any) {
    console.log('FETCH-ERR:', e.message);
    console.log('CAUSE-CODE:', e.cause?.code);
    console.log('CAUSE-MSG:', e.cause?.message);
  }
})();
