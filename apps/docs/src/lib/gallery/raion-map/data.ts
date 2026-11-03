import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { LocaleCode } from '@samizdata/mozaic/locale';
import topology from '../../data/moldova-adm1.topo.json';
import { seeded } from '../../random';

type Props = { name: string; iso: string };
export type Raion = Feature<Geometry, Props> & { id: string; value: number | null };

const topo = topology as unknown as Topology<{ raions: GeometryCollection<Props> }>;
const collection = feature(topo, topo.objects.raions) as FeatureCollection<Geometry, Props>;

/** Units with no data in this test (outside government control). */
const noData = new Set(['Transnistria', 'Bender']);

const random = seeded(47);
export const raions: Raion[] = collection.features.map((f) => ({
	...f,
	id: f.properties.name,
	// Synthetic share between 5% and 45%.
	value: noData.has(f.properties.name) ? null : Math.round((0.05 + random() * 0.4) * 1000) / 1000
}));

/** The whole country, for fitting the projection. */
export const outline: FeatureCollection = collection;

/** geoBoundaries names lack diacritics; these are the display names. */
const names: Record<string, { ro: string; ru: string; en?: string }> = {
	Cahul: { ro: 'Cahul', ru: 'Кагул' },
	Gagauzia: { ro: 'UTA Găgăuzia', ru: 'Гагаузия', en: 'Gagauzia' },
	Taraclia: { ro: 'Taraclia', ru: 'Тараклия' },
	Cantemir: { ro: 'Cantemir', ru: 'Кантемир' },
	Basarabeasca: { ro: 'Basarabeasca', ru: 'Басарабяска' },
	Leova: { ro: 'Leova', ru: 'Леова' },
	Cimislia: { ro: 'Cimișlia', ru: 'Чимишлия' },
	'Stefan Voda': { ro: 'Ștefan Vodă', ru: 'Штефан-Водэ' },
	Bender: { ro: 'Bender', ru: 'Бендеры' },
	Causeni: { ro: 'Căușeni', ru: 'Каушаны' },
	Hincesti: { ro: 'Hîncești', ru: 'Хынчешты' },
	Ialoveni: { ro: 'Ialoveni', ru: 'Яловены' },
	Nisporeni: { ro: 'Nisporeni', ru: 'Ниспорены' },
	Chisinau: { ro: 'Chișinău', ru: 'Кишинёв' },
	'Anenii Noi': { ro: 'Anenii Noi', ru: 'Новые Анены' },
	Criuleni: { ro: 'Criuleni', ru: 'Криуляны' },
	Straseni: { ro: 'Strășeni', ru: 'Страшены' },
	Ungheni: { ro: 'Ungheni', ru: 'Унгены' },
	Dubasari: { ro: 'Dubăsari', ru: 'Дубоссары' },
	Calarasi: { ro: 'Călărași', ru: 'Калараш' },
	Transnistria: { ro: 'Stînga Nistrului', ru: 'Левобережье Днестра', en: 'Transnistria' },
	Falesti: { ro: 'Fălești', ru: 'Фалешты' },
	Orhei: { ro: 'Orhei', ru: 'Оргеев' },
	Glodeni: { ro: 'Glodeni', ru: 'Глодяны' },
	Balti: { ro: 'Bălți', ru: 'Бельцы' },
	Telenesti: { ro: 'Telenești', ru: 'Теленешты' },
	SIngerei: { ro: 'Sîngerei', ru: 'Сынжерей' },
	RIscani: { ro: 'Rîșcani', ru: 'Рышканы' },
	Rezina: { ro: 'Rezina', ru: 'Резина' },
	Soldanesti: { ro: 'Șoldănești', ru: 'Шолданешты' },
	Floresti: { ro: 'Florești', ru: 'Флорешты' },
	Drochia: { ro: 'Drochia', ru: 'Дрокия' },
	Edinet: { ro: 'Edineț', ru: 'Единцы' },
	Briceni: { ro: 'Briceni', ru: 'Бричаны' },
	Soroca: { ro: 'Soroca', ru: 'Сороки' },
	Donduseni: { ro: 'Dondușeni', ru: 'Дондюшаны' },
	Ocnita: { ro: 'Ocnița', ru: 'Окница' }
};

export function displayName(id: string, locale: LocaleCode): string {
	const entry = names[id];
	if (!entry) return id;
	return locale === 'en' ? (entry.en ?? entry.ro) : entry[locale];
}

export const messages: Record<
	LocaleCode,
	{
		title: string;
		subtitle: string;
		alt: string;
		noData: string;
		notes: string;
		source: string;
	}
> = {
	en: {
		title: 'Shares vary widely between districts',
		subtitle: 'Share of households, by district (illustrative data)',
		alt: 'Map of Moldova by district, shaded by a synthetic share from 5% to 45%. No data for the Transnistrian region and Bender.',
		noData: 'No data',
		notes: 'Synthetic values for testing the chart library. Not real figures.',
		source: 'mozaic test data; boundaries: geoBoundaries (UNHCR, OCHA), CC BY 3.0 IGO'
	},
	ro: {
		title: 'Ponderile variază mult de la un raion la altul',
		subtitle: 'Ponderea gospodăriilor, pe raioane (date ilustrative)',
		alt: 'Harta Moldovei pe raioane, colorată după o pondere sintetică între 5% și 45%. Fără date pentru regiunea transnistreană și Bender.',
		noData: 'Fără date',
		notes: 'Valori sintetice pentru testarea bibliotecii. Nu sunt date reale.',
		source: 'date de test mozaic; limite: geoBoundaries (UNHCR, OCHA), CC BY 3.0 IGO'
	},
	ru: {
		title: 'Доли сильно различаются по районам',
		subtitle: 'Доля домохозяйств по районам (условные данные)',
		alt: 'Карта Молдовы по районам, окрашенная по синтетической доле от 5% до 45%. Нет данных по Приднестровью и Бендерам.',
		noData: 'Нет данных',
		notes: 'Синтетические значения для тестирования библиотеки. Не реальные данные.',
		source: 'тестовые данные mozaic; границы: geoBoundaries (UNHCR, OCHA), CC BY 3.0 IGO'
	}
};
