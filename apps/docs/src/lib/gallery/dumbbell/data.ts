import type { Messages } from '../types';

export interface Row {
	sector: string;
	/** Average monthly wage, lei, synthetic. */
	women: number;
	men: number;
}

export const rows: Row[] = [
	{ sector: 'finance', women: 16800, men: 21900 },
	{ sector: 'it', women: 24100, men: 31500 },
	{ sector: 'health', women: 11200, men: 12900 },
	{ sector: 'education', women: 9800, men: 10400 },
	{ sector: 'retail', women: 8700, men: 10900 },
	{ sector: 'construction', women: 10100, men: 11300 },
	{ sector: 'public', women: 12900, men: 14100 }
];

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	women: string;
	men: string;
	sectors: Record<string, string>;
}> = {
	en: {
		title: 'Men earn more in every sector',
		subtitle: 'Average monthly wage by sector, lei',
		alt: 'Dumbbell chart of average wages for women and men in seven sectors. Men earn more in all of them; the gap is largest in IT and finance.',
		women: 'Women',
		men: 'Men',
		sectors: {
			finance: 'Finance',
			it: 'IT',
			health: 'Health',
			education: 'Education',
			retail: 'Retail',
			construction: 'Construction',
			public: 'Public administration'
		}
	},
	ro: {
		title: 'Bărbații câștigă mai mult în fiecare sector',
		subtitle: 'Salariul mediu lunar pe sectoare, lei',
		alt: 'Grafic de tip haltera cu salariile medii ale femeilor și bărbaților în șapte sectoare. Bărbații câștigă mai mult în toate; decalajul e maxim în IT și finanțe.',
		women: 'Femei',
		men: 'Bărbați',
		sectors: {
			finance: 'Finanțe',
			it: 'IT',
			health: 'Sănătate',
			education: 'Educație',
			retail: 'Comerț',
			construction: 'Construcții',
			public: 'Administrație publică'
		}
	},
	ru: {
		title: 'Мужчины зарабатывают больше во всех отраслях',
		subtitle: 'Средняя месячная зарплата по отраслям, лей',
		alt: 'Гантельная диаграмма средних зарплат женщин и мужчин в семи отраслях. Мужчины зарабатывают больше во всех; разрыв максимален в IT и финансах.',
		women: 'Женщины',
		men: 'Мужчины',
		sectors: {
			finance: 'Финансы',
			it: 'IT',
			health: 'Здравоохранение',
			education: 'Образование',
			retail: 'Торговля',
			construction: 'Строительство',
			public: 'Госуправление'
		}
	}
};
