import { seeded } from '../../random';
import type { Messages } from '../types';

export const sources = ['gas', 'hydro', 'wind', 'solar', 'imports'] as const;
export type Source = (typeof sources)[number];
export interface Row {
	year: string;
	source: Source;
	/** Terawatt-hours, synthetic. */
	twh: number;
}

const random = seeded(11);
const start: Record<Source, number> = { gas: 2.4, hydro: 0.6, wind: 0.05, solar: 0.02, imports: 1.6 };
const trend: Record<Source, number> = { gas: -0.12, hydro: 0, wind: 0.07, solar: 0.06, imports: 0.02 };
export const rows: Row[] = Array.from({ length: 10 }, (_, i) => 2016 + i).flatMap((year, i) =>
	sources.map((source) => ({
		year: String(year),
		source,
		twh: Math.max(0.01, Math.round((start[source] + trend[source] * i + (random() - 0.5) * 0.15) * 100) / 100)
	}))
);

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	total: string;
	share: string;
	measure: string;
	unit: string;
	sources: Record<Source, string>;
}> = {
	en: {
		title: 'Wind and solar grew from almost nothing',
		subtitle: 'Electricity supply by source, terawatt-hours',
		alt: 'Stacked column chart of electricity supply by source, 2016 to 2025. Gas shrinks while wind and solar grow.',
		total: 'Total',
		share: 'Share',
		measure: 'Measure',
		unit: 'TWh',
		sources: { gas: 'Gas', hydro: 'Hydro', wind: 'Wind', solar: 'Solar', imports: 'Imports' }
	},
	ro: {
		title: 'Energia eoliană și solară au crescut aproape de la zero',
		subtitle: 'Aprovizionarea cu electricitate pe surse, terawați-oră',
		alt: 'Grafic cu coloane suprapuse al aprovizionării cu electricitate pe surse, 2016–2025. Gazul scade, iar eolianul și solarul cresc.',
		total: 'Total',
		share: 'Pondere',
		measure: 'Măsura',
		unit: 'TWh',
		sources: { gas: 'Gaze', hydro: 'Hidro', wind: 'Eolian', solar: 'Solar', imports: 'Importuri' }
	},
	ru: {
		title: 'Ветер и солнце выросли почти с нуля',
		subtitle: 'Поставки электроэнергии по источникам, тераватт-часы',
		alt: 'Столбчатая диаграмма с накоплением поставок электроэнергии по источникам, 2016–2025. Газ сокращается, ветер и солнце растут.',
		total: 'Всего',
		share: 'Доля',
		measure: 'Показатель',
		unit: 'ТВт·ч',
		sources: { gas: 'Газ', hydro: 'ГЭС', wind: 'Ветер', solar: 'Солнце', imports: 'Импорт' }
	}
};
