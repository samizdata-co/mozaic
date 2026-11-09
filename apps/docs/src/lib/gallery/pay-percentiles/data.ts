import type { Messages } from '../types';

export interface Row {
	group: string;
	/** Monthly pay at each published percentile, synthetic. The 90th is "not published" for nurses. */
	percentiles: { p: number; value: number | null }[];
}

const at = (values: (number | null)[]) => [10, 25, 50, 75, 90].map((p, i) => ({ p, value: values[i] }));

export const rows: Row[] = [
	{ group: 'nurses', percentiles: at([11800, 13400, 14900, 16600, null]) },
	{ group: 'teachers', percentiles: at([10900, 12700, 14300, 16900, 19200]) },
	{ group: 'all', percentiles: at([6400, 8700, 11900, 17300, 25800]) }
];

export const messages: Messages<{
	title: string;
	subtitle: string;
	alt: string;
	input: string;
	you: string;
	readout: string;
	median: string;
	middle: string;
	range: string;
	percentile: (p: number) => string;
	/** Sentence for the highlighted group: inside, above or below the published range. */
	summary: (share: string, group: string, where: 'in' | 'above' | 'below') => string;
	groups: Record<string, string>;
	/** Group names inside a sentence. */
	inText: Record<string, string>;
}> = {
	en: {
		title: 'Nurses’ pay is bunched far more tightly than pay overall',
		subtitle: 'Gross monthly pay at each percentile. Enter yours to see where it sits',
		alt: 'Strips showing pay percentiles for nurses, teachers and all employees. The middle half of nurses earn between 13,400 and 16,600 a month; the middle half of all employees between 8,700 and 17,300.',
		input: 'Your monthly pay',
		you: 'You',
		readout: 'You earn more than',
		median: 'Median',
		middle: 'Middle half',
		range: '10th to 90th percentile',
		percentile: (p) => `${p}th percentile`,
		summary: (share, group, where) =>
			where === 'below'
				? `You are in the bottom ${share} of ${group}.`
				: `You earn more than ${where === 'above' ? 'at least' : 'about'} ${share} of ${group}.`,
		groups: { nurses: 'Nurses', teachers: 'Teachers', all: 'All employees' },
		inText: { nurses: 'nurses', teachers: 'teachers', all: 'all employees' }
	},
	ro: {
		title: 'Salariile asistentelor medicale sunt mult mai strânse decât salariile în general',
		subtitle: 'Salariul brut lunar la fiecare percentilă. Introduceți-l pe al dvs. ca să vedeți unde se situează',
		alt: 'Benzi cu percentilele salariale pentru asistente medicale, profesori și toți angajații. Jumătatea din mijloc a asistentelor câștigă între 13.400 și 16.600 pe lună; a tuturor angajaților, între 8.700 și 17.300.',
		input: 'Salariul dvs. lunar',
		you: 'Dvs.',
		readout: 'Câștigați mai mult decât',
		median: 'Mediana',
		middle: 'Jumătatea din mijloc',
		range: 'Percentilele 10–90',
		percentile: (p) => `percentila ${p}`,
		summary: (share, group, where) =>
			where === 'below'
				? `Sunteți printre cei mai prost plătiți ${share} dintre ${group}.`
				: `Câștigați mai mult decât ${where === 'above' ? 'cel puțin' : 'aproximativ'} ${share} dintre ${group}.`,
		groups: { nurses: 'Asistente medicale', teachers: 'Profesori', all: 'Toți angajații' },
		inText: { nurses: 'asistentele medicale', teachers: 'profesori', all: 'toți angajații' }
	},
	ru: {
		title: 'Зарплаты медсестёр гораздо плотнее, чем зарплаты в целом',
		subtitle: 'Начисленная месячная зарплата по процентилям. Введите свою, чтобы увидеть, где она',
		alt: 'Полосы с процентилями зарплат медсестёр, учителей и всех работников. Средняя половина медсестёр получает от 13 400 до 16 600 в месяц; средняя половина всех работников — от 8 700 до 17 300.',
		input: 'Ваша месячная зарплата',
		you: 'Вы',
		readout: 'Вы получаете больше, чем',
		median: 'Медиана',
		middle: 'Средняя половина',
		range: '10–90-й процентили',
		percentile: (p) => `${p}-й процентиль`,
		summary: (share, group, where) =>
			where === 'below'
				? `Вы среди ${share} самых низкооплачиваемых в группе «${group}».`
				: `Вы получаете больше, чем ${where === 'above' ? 'как минимум' : 'примерно'} ${share} из группы «${group}».`,
		groups: { nurses: 'Медсёстры', teachers: 'Учителя', all: 'Все работники' },
		inText: { nurses: 'медсёстры', teachers: 'учителя', all: 'все работники' }
	}
};
