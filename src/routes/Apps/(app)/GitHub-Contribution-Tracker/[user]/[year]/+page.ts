import type { PageLoad, PageParentData } from './$types';
import { writable } from 'svelte/store';
import { parseHTML } from 'linkedom';

function extractContributionData(html: any): ContributionsData {
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

interface ContributionsByMonth {
	[month: string]: {
		[day: string]: number;
	};
}

let contributionsByMonth: ContributionsByMonth = {};

const monthOrder = [
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

const monthAbs = [
	{
		name: 'Jan',
		full_name: 'January'
	},
	{
		name: 'Feb',
		full_name: 'February'
	},
	{
		name: 'Mar',
		full_name: 'March'
	},
	{
		name: 'Apr',
		full_name: 'April'
	},
	{
		name: 'May',
		full_name: 'May'
	},
	{
		name: 'Jun',
		full_name: 'June'
	},
	{
		name: 'Jul',
		full_name: 'July'
	},
	{
		name: 'Aug',
		full_name: 'August'
	},
	{
		name: 'Sep',
		full_name: 'September'
	},
	{
		name: 'Oct',
		full_name: 'October'
	},
	{
		name: 'Nov',
		full_name: 'November'
	},
	{
		name: 'Dec',
		full_name: 'December'
	}
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
		const indexA = monthOrder.indexOf(monthA);
		const indexB = monthOrder.indexOf(monthB);

		// Sort by month first
		if (indexA < indexB) return -1;
		if (indexA > indexB) return 1;

		// If months are equal, sort by day
		const dayA = Object.keys(daysA)[0];
		const dayB = Object.keys(daysB)[0];
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

export const load: PageLoad = async ({ parent, data }) => {
	await parent();
	let { props, contributionsInfo, streakStats, gitContributions } = data;

	const user = props.user;
	const year = props.year;

	const jsonData = extractContributionData(contributionsInfo);

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
		gitContributions,
		totalContributions,
		monthAbs,
		page_data: {
			jsonData,
			totalContributions,
			dataSet,
			sortedContributions
		}
	};
};
