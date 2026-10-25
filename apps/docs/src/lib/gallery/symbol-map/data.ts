import { geoCentroid } from 'd3-geo';
import { raions, outline } from '../raion-map/data';
import { seeded } from '../../random';
import type { Messages } from '../types';

export { outline, raions };

const random = seeded(8);
/** One circle per unit at its centroid, sized by a synthetic count. */
export const symbols = raions
	.filter((r) => r.value !== null)
	.map((r) => {
		const [lon, lat] = geoCentroid(r);
		const big = r.id === 'Chisinau' ? 9 : r.id === 'Balti' ? 3 : 1;
		return { id: r.id, lon, lat, count: Math.round((200 + random() * 1800) * big) };
	});

export const messages: Messages<{ title: string; subtitle: string; alt: string; legend: string; unit: string }> = {
	en: {
		title: 'New businesses cluster in the capital',
		subtitle: 'Companies registered in 2025, by district',
		alt: 'Map of Moldova with a circle per district sized by new companies. Chișinău’s circle is by far the largest.',
		legend: 'Companies',
		unit: 'companies'
	},
	ro: {
		title: 'Firmele noi se concentrează în capitală',
		subtitle: 'Companii înregistrate în 2025, pe raioane',
		alt: 'Harta Moldovei cu câte un cerc pe raion, dimensionat după numărul de firme noi. Cercul Chișinăului e de departe cel mai mare.',
		legend: 'Companii',
		unit: 'companii'
	},
	ru: {
		title: 'Новые компании сосредоточены в столице',
		subtitle: 'Компании, зарегистрированные в 2025 году, по районам',
		alt: 'Карта Молдовы с кругом для каждого района, размер — число новых компаний. Круг Кишинёва намного больше остальных.',
		legend: 'Компании',
		unit: 'компаний'
	}
};
