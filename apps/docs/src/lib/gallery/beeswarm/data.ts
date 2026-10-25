import { seeded } from '../../random';
import type { Messages } from '../types';

export interface Row {
	name: string;
	/** Local budget per resident, lei, synthetic. */
	perResident: number;
}

const random = seeded(23);
const names = [
	'Anenii Noi',
	'Basarabeasca',
	'Briceni',
	'Cahul',
	'Cantemir',
	'Călărași',
	'Căușeni',
	'Cimișlia',
	'Criuleni',
	'Dondușeni',
	'Drochia',
	'Dubăsari',
	'Edineț',
	'Fălești',
	'Florești',
	'Glodeni',
	'Hîncești',
	'Ialoveni',
	'Leova',
	'Nisporeni',
	'Ocnița',
	'Orhei',
	'Rezina',
	'Rîșcani',
	'Sîngerei',
	'Soroca',
	'Strășeni',
	'Șoldănești',
	'Ștefan Vodă',
	'Taraclia',
	'Telenești',
	'Ungheni',
	'Bălți',
	'Chișinău',
	'Găgăuzia'
];
// The two big cities are fixed so the headline always holds; the rest cluster around 3,200.
const fixed: Record<string, number> = { Chișinău: 7400, Bălți: 5600 };
export const rows: Row[] = names.map((name) => ({
	name,
	perResident: fixed[name] ?? Math.round(3200 + (random() + random() + random() - 1.5) * 800)
}));

export const messages: Messages<{ title: string; subtitle: string; alt: string }> = {
	en: {
		title: 'The two big cities spend far more per resident',
		subtitle: 'Local budget per resident by district, lei; each dot is a district',
		alt: 'Beeswarm chart of local budget per resident in 35 districts. Most cluster between 2,000 and 4,500 lei; Chișinău and Bălți stand out above 5,000.'
	},
	ro: {
		title: 'Cele două mari orașe cheltuie mult mai mult pe locuitor',
		subtitle: 'Bugetul local pe locuitor, pe raioane, lei; fiecare punct e un raion',
		alt: 'Grafic de tip roi al bugetului local pe locuitor în 35 de raioane. Majoritatea sunt între 2.000 și 4.500 lei; Chișinăul și Bălțiul depășesc 5.000.'
	},
	ru: {
		title: 'Два крупных города тратят на жителя гораздо больше',
		subtitle: 'Местный бюджет на жителя по районам, лей; каждая точка — район',
		alt: 'Диаграмма-рой местного бюджета на жителя в 35 районах. Большинство между 2 000 и 4 500 лей; Кишинёв и Бельцы выделяются, выше 5 000.'
	}
};
