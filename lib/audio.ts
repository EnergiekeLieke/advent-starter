// Audio in een deurtje: een SoundCloud-link. We tonen de standaardspeler van SoundCloud in een iframe,
// pas als de bezoeker het deurtje opent. Deze hulpfuncties maken van wat de beheerder plakt een nette link
// en van die link het adres van de speler.

const SOUNDCLOUD_HOSTS = ['soundcloud.com', 'www.soundcloud.com', 'm.soundcloud.com'];

function alsUrl(tekst: string): URL | null {
  try {
    return new URL(tekst);
  } catch {
    return null;
  }
}

/**
 * Maakt van wat de beheerder plakt een nette SoundCloud-link. Dat mag zijn:
 * - het adres uit de adresbalk (met of zonder tracking zoals ?si=...)
 * - de hele insluitcode (<iframe ... src="https://w.soundcloud.com/player/?url=...">)
 * - het adres van de speler zelf (w.soundcloud.com/player/?url=...)
 * Is het niets van dat alles, dan blijft de tekst zoals hij was en keurt `audioGeldig` hem af.
 */
export function schoonAudio(invoer: string): string {
  let tekst = invoer.trim();
  if (tekst === '') return '';
  const uitIframe = tekst.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  if (uitIframe) tekst = uitIframe[1].replace(/&amp;/g, '&');
  // Zonder https:// ervoor (bijvoorbeeld "soundcloud.com/naam/track") zetten we dat er zelf voor
  if (/^(www\.|m\.)?soundcloud\.com\//i.test(tekst)) tekst = `https://${tekst}`;
  let url = alsUrl(tekst);
  if (url && url.hostname === 'w.soundcloud.com') {
    const binnen = url.searchParams.get('url');
    url = binnen ? alsUrl(binnen) : null;
  }
  // De insluitcode van SoundCloud zelf bevat een adres als api.soundcloud.com/tracks/123456789. Dat werkt in de speler.
  if (url && url.hostname === 'api.soundcloud.com') {
    const geheimApi = url.searchParams.get('secret_token');
    return `https://api.soundcloud.com${url.pathname.replace(/\/+$/, '')}${geheimApi ? `?secret_token=${geheimApi}` : ''}`;
  }
  if (!url || !SOUNDCLOUD_HOSTS.includes(url.hostname)) return tekst;
  // Een geheim deel van een privélink zit in het pad of in secret_token. Andere onderdelen (zoals ?si=) laten we weg.
  const geheim = url.searchParams.get('secret_token');
  return `https://soundcloud.com${url.pathname.replace(/\/+$/, '')}${geheim ? `?secret_token=${geheim}` : ''}`;
}

/** Een geldige link naar een geluidsbestand of lijst op soundcloud.com, of leeg. */
export function audioGeldig(url: string): boolean {
  if (url === '') return true;
  const u = alsUrl(url);
  if (!u || u.protocol !== 'https:') return false;
  // Het adres uit de insluitcode: api.soundcloud.com/tracks/<nummer> of /playlists/<nummer>
  if (u.hostname === 'api.soundcloud.com') return /^\/(tracks|playlists)\/\d+$/.test(u.pathname);
  if (u.hostname !== 'soundcloud.com') return false;
  // Een link naar alleen een profiel (soundcloud.com/naam) is geen geluidsbestand
  return u.pathname.split('/').filter(Boolean).length >= 2;
}

/** Het adres van de SoundCloud-speler voor in een iframe, of null als er geen geldige audio is. */
export function audioSpelerUrl(invoer: string, kleur: string): string | null {
  const url = schoonAudio(invoer);
  if (url === '' || !audioGeldig(url)) return null;
  const params = new URLSearchParams({
    url,
    color: kleur,
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

export const AUDIO_FOUTMELDING =
  'Gebruik de link van je geluidsbestand op soundcloud.com, bijvoorbeeld https://soundcloud.com/jouwnaam/jouw-track. Gebruik je een korte link (on.soundcloud.com)? Open die dan eerst in je browser en kopieer het adres uit de adresbalk.';
