import type { LocaleCode } from '@samizdata/mozaic/locale';
import { styles, type StyleName } from './styles';

const KEY = 'mozaic-docs-settings';

/** Style and language shared by every chart on the docs site; remembered per browser. */
export const settings = $state<{ style: StyleName; locale: LocaleCode }>({ style: 'zdg', locale: 'en' });

export function loadSettings(): void {
	try {
		const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
		if (saved.style in styles) settings.style = saved.style;
		if (saved.locale) settings.locale = saved.locale;
	} catch {
		// Storage unavailable (private mode, blocked): keep defaults.
	}
}

export function saveSettings(): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(settings));
	} catch {
		// Ignore: the setting just won't persist.
	}
}
