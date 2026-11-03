import type { Component } from 'svelte';
import type { LocaleCode } from 'mozaic/locale';
import type { Medium, Theme } from 'mozaic/styles';

/** Props every gallery chart accepts. */
export interface ExampleProps {
	style: Theme;
	locale: LocaleCode;
	medium?: Medium;
	width?: number;
}

export interface Example {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	component: Component<ExampleProps>;
	/** Source of Chart.svelte, shown on the example page. */
	source: string;
	/** Source of data.ts, if any. */
	data?: string;
	/** `story` examples are full pages (scrollytelling) and have no embed. */
	kind?: 'chart' | 'story';
	/** Print widths exported by `mozaic export`. */
	print?: string[];
}

export type Messages<T> = Record<LocaleCode, T>;
