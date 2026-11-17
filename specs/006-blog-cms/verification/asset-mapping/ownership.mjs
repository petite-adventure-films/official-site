// URL ownership is a migration-routing hint, never evidence of byte identity or an issued asset ID.
const hosts=new Set(['www.petiteadventurefilms.com','petiteadventurefilms.com']);
export function classify(url){const u=new URL(url);return hosts.has(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&!u.port&&u.pathname.startsWith('/wp/wp-content/uploads/')?'owned-upload':'external';}
