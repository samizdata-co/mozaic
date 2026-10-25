import type { FormatLocaleDefinition } from 'd3-format';
import type { TimeLocaleDefinition } from 'd3-time-format';

export interface LocaleStrings {
	source: string;
	sources: string;
	note: string;
	notes: string;
	graphic: string;
	showData: string;
	downloadData: string;
	noData: string;
	search: string;
	showAll: (n: number) => string;
	showFewer: string;
}

export interface LocaleDefinition {
	/** BCP 47 language tag for the `lang` attribute. */
	lang: string;
	number: FormatLocaleDefinition;
	time: TimeLocaleDefinition;
	strings: LocaleStrings;
}

// Moldova-oriented locales: currency is the Moldovan leu in ro and ru.
export const definitions = {
	en: {
		lang: 'en-GB',
		number: { decimal: '.', thousands: ',', grouping: [3], currency: ['£', ''], minus: '−' },
		time: {
			dateTime: '%a %e %b %X %Y',
			date: '%d/%m/%Y',
			time: '%H:%M:%S',
			periods: ['AM', 'PM'],
			days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			months: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			],
			shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		},
		strings: {
			source: 'Source',
			sources: 'Sources',
			note: 'Note',
			notes: 'Notes',
			graphic: 'Graphic',
			showData: 'Show the data',
			downloadData: 'Download the data (CSV)',
			noData: 'No data',
			search: 'Search',
			showAll: (n) => `Show all ${n} rows`,
			showFewer: 'Show fewer rows'
		}
	},
	ro: {
		lang: 'ro-MD',
		number: { decimal: ',', thousands: '.', grouping: [3], currency: ['', ' lei'], minus: '−' },
		time: {
			dateTime: '%A, %e %B %Y, %X',
			date: '%d.%m.%Y',
			time: '%H:%M:%S',
			periods: ['AM', 'PM'],
			days: ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'],
			shortDays: ['dum.', 'lun.', 'mar.', 'mie.', 'joi', 'vin.', 'sâm.'],
			months: [
				'ianuarie',
				'februarie',
				'martie',
				'aprilie',
				'mai',
				'iunie',
				'iulie',
				'august',
				'septembrie',
				'octombrie',
				'noiembrie',
				'decembrie'
			],
			shortMonths: ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sept.', 'oct.', 'nov.', 'dec.']
		},
		strings: {
			source: 'Sursa',
			sources: 'Surse',
			note: 'Notă',
			notes: 'Note',
			graphic: 'Grafic',
			showData: 'Arată datele',
			downloadData: 'Descarcă datele (CSV)',
			noData: 'Fără date',
			search: 'Caută',
			showAll: (n) => `Arată toate cele ${n} rânduri`,
			showFewer: 'Arată mai puține rânduri'
		}
	},
	ru: {
		lang: 'ru-MD',
		number: { decimal: ',', thousands: ' ', grouping: [3], currency: ['', ' лей'], minus: '−' },
		time: {
			dateTime: '%A, %e %B %Y г. %X',
			date: '%d.%m.%Y',
			time: '%H:%M:%S',
			periods: ['AM', 'PM'],
			days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
			shortDays: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
			months: [
				'январь',
				'февраль',
				'март',
				'апрель',
				'май',
				'июнь',
				'июль',
				'август',
				'сентябрь',
				'октябрь',
				'ноябрь',
				'декабрь'
			],
			shortMonths: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
		},
		strings: {
			source: 'Источник',
			sources: 'Источники',
			note: 'Примечание',
			notes: 'Примечания',
			graphic: 'Графика',
			showData: 'Показать данные',
			downloadData: 'Скачать данные (CSV)',
			noData: 'Нет данных',
			search: 'Поиск',
			showAll: (n) => `Показать все строки (${n})`,
			showFewer: 'Показать меньше строк'
		}
	}
} satisfies Record<string, LocaleDefinition>;
