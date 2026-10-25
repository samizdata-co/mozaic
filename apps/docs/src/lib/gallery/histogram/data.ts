import { seeded } from '../../random';
import type { Messages } from '../types';

const random = seeded(17);
/** Synthetic monthly household incomes (lei), right-skewed like real incomes. */
export const incomes: number[] = Array.from({ length: 2000 }, () => {
	const normal = Math.sqrt(-2 * Math.log(random() || 1e-9)) * Math.cos(2 * Math.PI * random());
	return Math.round(Math.exp(9.1 + normal * 0.45));
}).filter((v) => v < 40000);

export const messages: Messages<{ title: string; subtitle: string; alt: string; median: string; households: string }> =
	{
		en: {
			title: 'Most households earn less than the average',
			subtitle: 'Households by monthly income, lei',
			alt: 'Histogram of monthly household income. Most households cluster between 5,000 and 12,000 lei, with a long tail of higher incomes.',
			median: 'Median',
			households: 'households'
		},
		ro: {
			title: 'Majoritatea gospodăriilor câștigă sub medie',
			subtitle: 'Gospodăriile după venitul lunar, lei',
			alt: 'Histogramă a venitului lunar al gospodăriilor. Majoritatea sunt între 5.000 și 12.000 lei, cu o coadă lungă de venituri mai mari.',
			median: 'Mediana',
			households: 'gospodării'
		},
		ru: {
			title: 'Большинство домохозяйств зарабатывает меньше среднего',
			subtitle: 'Домохозяйства по месячному доходу, лей',
			alt: 'Гистограмма месячного дохода домохозяйств. Большинство между 5 000 и 12 000 лей, с длинным хвостом более высоких доходов.',
			median: 'Медиана',
			households: 'домохозяйств'
		}
	};
