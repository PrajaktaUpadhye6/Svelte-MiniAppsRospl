import type { PageLoad } from './$types';

import { writable } from 'svelte/store';
import { parseHTML } from 'linkedom';

export function _extractContributionData(html: any): ContributionsData {
	const { document } = parseHTML(html);
	const tooltips = document.querySelectorAll('tool-tip');
	const contributionsData: any[] = [];

	tooltips.forEach((tooltip) => {
		const content = tooltip.textContent?.trim() ?? '';
		contributionsData.push([content]);
	});

	return contributionsData;
}

export type ContributionsData = string[][];

export let _contributions = writable([
	{ date: 'January', count: 0 },
	{ date: 'February', count: 0 },
	{ date: 'March', count: 0 },
	{ date: 'April', count: 0 },
	{ date: 'May', count: 0 },
	{ date: 'June', count: 0 },
	{ date: 'July', count: 0 },
	{ date: 'August', count: 0 },
	{ date: 'September', count: 0 },
	{ date: 'October', count: 0 },
	{ date: 'November', count: 0 },
	{ date: 'December', count: 0 }
]);

export const _parseData = (data: ContributionsData) => {
	data.forEach((entry) => {
		const [contributionString] = entry;
		const match = contributionString.match(/(\d+) contributions? on (\w+)/);
		if (match) {
			const [, count, month] = match;
			_contributions.update((current) => {
				const monthIndex = current.findIndex((m) => m.date === month);
				if (monthIndex !== -1) {
					current[monthIndex].count += parseInt(count, 10);
				}

				return current;
			});
		}
	});
};

export interface ContributionsByMonth {
	[month: string]: {
		[day: string]: number;
	};
}

export let _contributionsByMonth: ContributionsByMonth = {};

export const _monthOrder = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

interface ContributionsDataForSorting {
	[month: string]: {
		[day: string]: number;
	};
}

function sortContributionsByMonth(
	contributionsByMonth: ContributionsDataForSorting
): ContributionsDataForSorting {
	// Convert the object into an array of entries
	const entries = Object.entries(contributionsByMonth);

	// Sort the entries by month and then by day
	const sortedEntries = entries.sort(([monthA, daysA], [monthB, daysB]) => {
		// Get the index of each month in the monthOrder array
		const indexA = _monthOrder.indexOf(monthA);
		const indexB = _monthOrder.indexOf(monthB);

		// Sort by month first
		if (indexA < indexB) return -1;
		if (indexA > indexB) return 1;

		// If months are equal, sort by day
		const dayA = Object.keys(daysA)[0]; // Assuming you want to sort by the first day of each month
		const dayB = Object.keys(daysB)[0]; // Assuming you want to sort by the first day of each month
		return dayA.localeCompare(dayB); // Use localeCompare for string comparison
	});

	// Convert the sorted array back into an object
	const sortedContributionsByMonth: ContributionsDataForSorting = {};
	sortedEntries.forEach(([month, days]) => {
		sortedContributionsByMonth[month] = days;
	});

	return sortedContributionsByMonth;
}

interface OutputEntry {
	date: string;
	value: number;
}

export const _sortedContributions = sortContributionsByMonth(_contributionsByMonth);

//console.log(_sortedContributions);

export const load: PageLoad = async ({ parent, data }) => {
	await parent();
	let { props, contributionsInfo, streakStats } = data;

	const user = props.user;
	const year = props.year;

	const jsonData = _extractContributionData(contributionsInfo);

	let contributionsByMonth: ContributionsByMonth = {};

	jsonData.forEach((entry) => {
		const [contributionString] = entry;
		const match = contributionString.match(/(\d+) contributions? on (\w+) (\d+)/);
		if (match) {
			const [, count, month, day] = match;
			if (!contributionsByMonth[month]) {
				contributionsByMonth[month] = {};
			}
			contributionsByMonth[month][day] = parseInt(count, 10);
		}
	});

	Object.keys(contributionsByMonth).forEach((month) => {
		if (Object.values(contributionsByMonth[month]).reduce((a, b) => a + b, 0) === 0) {
			delete contributionsByMonth[month];
		}
	});

	const sortedContributions = sortContributionsByMonth(contributionsByMonth);

	let dataSet: OutputEntry[] = jsonData
		.map((entry) => {
			const [contributionString] = entry;
			const match = contributionString.match(/(\d+) contributions? on (\w+) (\d+)/);
			if (match) {
				const [, count, month, day] = match;
				const date = new Date(`${month} ${day}, ${year}`);
				return { date: date.toISOString(), value: parseInt(count) };
			}
			return null;
		})
		.filter((entry) => entry !== null) as OutputEntry[];

	let totalContributions = dataSet.reduce((accumulator, current) => accumulator + current.value, 0);

	return {
		props,
		contributionsInfo,
		streakStats,
		page_data: {
			message: 'From the page.js',
			jsonData,
			totalContributions,
			dataSet,
			sortedContributions
		}
	};
};
