import type { Messages } from '../types';

export interface Row {
	institution: string;
	/** Share who trust it, %, synthetic. */
	before: number;
	after: number;
}

export const rows: Row[] = [
	{ institution: 'church', before: 78, after: 71 },
	{ institution: 'army', before: 52, after: 58 },
	{ institution: 'mayors', before: 49, after: 54 },
	{ institution: 'media', before: 41, after: 33 },
	{ institution: 'president', before: 21, after: 46 },
	{ institution: 'government', before: 17, after: 31 },
	{ institution: 'parliament', before: 13, after: 24 },
	{ institution: 'courts', before: 16, after: 19 },
	{ institution: 'parties', before: 11, after: 14 }
];

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	start: string;
	end: string;
	institutions: Record<string, string>;
}> = {
	en: {
		title: 'Trust in the president more than doubled',
		subtitle: 'Share who trust each institution, %; arrows run from 2015 to 2025',
		alt: 'Arrow plot of trust in nine institutions in 2015 and 2025. Trust in the president rose from 21% to 46%, the largest change; the church and the media lost trust.',
		start: '2015',
		end: '2025',
		institutions: {
			church: 'Church',
			army: 'Army',
			mayors: 'Mayors',
			media: 'Media',
			president: 'President',
			government: 'Government',
			parliament: 'Parliament',
			courts: 'Courts',
			parties: 'Parties'
		}
	},
	ro: {
		title: 'Încrederea în președinte s-a dublat',
		subtitle: 'Ponderea celor care au încredere în fiecare instituție, %; săgețile merg de la 2015 la 2025',
		alt: 'Grafic cu săgeți al încrederii în nouă instituții în 2015 și 2025. Încrederea în președinte a crescut de la 21% la 46%, cea mai mare schimbare; biserica și presa au pierdut încredere.',
		start: '2015',
		end: '2025',
		institutions: {
			church: 'Biserica',
			army: 'Armata',
			mayors: 'Primarii',
			media: 'Presa',
			president: 'Președintele',
			government: 'Guvernul',
			parliament: 'Parlamentul',
			courts: 'Instanțele',
			parties: 'Partidele'
		}
	},
	ru: {
		title: 'Доверие к президенту выросло более чем вдвое',
		subtitle: 'Доля доверяющих каждому институту, %; стрелки идут от 2015 к 2025 году',
		alt: 'Диаграмма со стрелками: доверие к девяти институтам в 2015 и 2025 годах. Доверие к президенту выросло с 21% до 46%, это самое большое изменение; церковь и СМИ потеряли доверие.',
		start: '2015',
		end: '2025',
		institutions: {
			church: 'Церковь',
			army: 'Армия',
			mayors: 'Примары',
			media: 'СМИ',
			president: 'Президент',
			government: 'Правительство',
			parliament: 'Парламент',
			courts: 'Суды',
			parties: 'Партии'
		}
	}
};
