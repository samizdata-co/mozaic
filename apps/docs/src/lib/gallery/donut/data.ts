import type { Messages } from '../types';

export interface Row {
	id: 'yes' | 'no' | 'unsure';
	share: number;
}

export const rows: Row[] = [
	{ id: 'yes', share: 0.54 },
	{ id: 'no', share: 0.31 },
	{ id: 'unsure', share: 0.15 }
];

export const messages: Messages<{ title: string; subtitle: string; alt: string; items: Record<Row['id'], string> }> = {
	en: {
		title: 'A majority supports the reform',
		subtitle: 'Answers to “Do you support the reform?”, share of respondents',
		alt: 'Donut chart of survey answers: 54% yes, 31% no, 15% unsure.',
		items: { yes: 'Yes', no: 'No', unsure: 'Unsure' }
	},
	ro: {
		title: 'O majoritate susține reforma',
		subtitle: 'Răspunsuri la „Susțineți reforma?”, ponderea respondenților',
		alt: 'Grafic inelar al răspunsurilor: 54% da, 31% nu, 15% nesiguri.',
		items: { yes: 'Da', no: 'Nu', unsure: 'Nu știu' }
	},
	ru: {
		title: 'Большинство поддерживает реформу',
		subtitle: 'Ответы на вопрос «Поддерживаете ли вы реформу?», доля респондентов',
		alt: 'Кольцевая диаграмма ответов: 54% да, 31% нет, 15% не уверены.',
		items: { yes: 'Да', no: 'Нет', unsure: 'Не уверены' }
	}
};
