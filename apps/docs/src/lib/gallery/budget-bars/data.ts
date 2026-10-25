import type { LocaleCode } from 'mozaic/locale';

export interface Row {
	id: string;
	/** Year-on-year change as a fraction (0.1 = +10%). Synthetic. */
	change: number;
}

export const rows: Row[] = [
	{ id: 'health', change: 0.18 },
	{ id: 'education', change: 0.09 },
	{ id: 'social', change: 0.12 },
	{ id: 'defence', change: 0.22 },
	{ id: 'agriculture', change: -0.04 },
	{ id: 'transport', change: 0.05 },
	{ id: 'culture', change: -0.07 },
	{ id: 'order', change: 0.03 },
	{ id: 'environment', change: -0.11 }
];

export const messages: Record<
	LocaleCode,
	{
		title: string;
		subtitle: string;
		callout: (value: string) => string;
		alt: string;
		notes: string;
		source: string;
		sectors: Record<string, string>;
	}
> = {
	en: {
		title: 'Defence spending grew the most',
		subtitle: 'Change in allocated budget by sector, 2025 to 2026 (illustrative data)',
		callout: (v) => `Largest rise:\n${v}`,
		alt: 'Horizontal bar chart of budget change by sector. Six sectors grew, led by defence; three shrank, environment the most.',
		notes: 'Synthetic values for testing the chart library. Not real figures.',
		source: 'mozaic test data',
		sectors: {
			health: 'Health',
			education: 'Education',
			social: 'Social protection',
			defence: 'Defence',
			agriculture: 'Agriculture',
			transport: 'Transport',
			culture: 'Culture',
			order: 'Public order',
			environment: 'Environment'
		}
	},
	ro: {
		title: 'Cheltuielile pentru apărare au crescut cel mai mult',
		subtitle: 'Schimbarea bugetului alocat pe sectoare, 2025–2026 (date ilustrative)',
		callout: (v) => `Cea mai mare creștere:\n${v}`,
		alt: 'Grafic cu bare orizontale al schimbării bugetului pe sectoare. Șase sectoare au crescut, în frunte cu apărarea; trei au scăzut, mediul cel mai mult.',
		notes: 'Valori sintetice pentru testarea bibliotecii. Nu sunt date reale.',
		source: 'date de test mozaic',
		sectors: {
			health: 'Sănătate',
			education: 'Educație',
			social: 'Protecție socială',
			defence: 'Apărare',
			agriculture: 'Agricultură',
			transport: 'Transport',
			culture: 'Cultură',
			order: 'Ordine publică',
			environment: 'Mediu'
		}
	},
	ru: {
		title: 'Больше всего выросли расходы на оборону',
		subtitle: 'Изменение бюджета по отраслям, 2025–2026 (условные данные)',
		callout: (v) => `Наибольший рост:\n${v}`,
		alt: 'Горизонтальная столбчатая диаграмма изменения бюджета по отраслям. Шесть отраслей выросли, больше всего оборона; три сократились, сильнее всего окружающая среда.',
		notes: 'Синтетические значения для тестирования библиотеки. Не реальные данные.',
		source: 'тестовые данные mozaic',
		sectors: {
			health: 'Здравоохранение',
			education: 'Образование',
			social: 'Социальная защита',
			defence: 'Оборона',
			agriculture: 'Сельское хозяйство',
			transport: 'Транспорт',
			culture: 'Культура',
			order: 'Общественный порядок',
			environment: 'Окружающая среда'
		}
	}
};
