import type { PageLoad } from './$types';

const features = [
	{
		title: 'Simple and Focused',
		description:
			'Each mini-app has a clear, single-purpose design, providing a clutter-free user experience. This focus ensures that the apps are easy to use and highly efficient for their specific tasks.'
	},
	{
		title: 'Standalone and Web-Based',
		description:
			'Svelte MiniApps are self-contained web applications. You can access and use them directly from your web browser without the need for mobile apps or other services. This makes them highly convenient and easily accessible.'
	},
	{
		title: 'Cross-Device Installation',
		description:
			'Additionally, Svelte MiniApps can be installed on any device but still run using the browser, providing the flexibility of web apps with the convenience of native applications.'
	},
	{
		title: 'Lightning Fast',
		description:
			'Built with SvelteKit, these mini-apps deliver exceptional performance and load times, ensuring a smooth and responsive user experience. The optimized JavaScript code generated by SvelteKit ensures that your applications run quickly and efficiently.'
	}
];

const reasons = [
	{
		title: "SvelteKit's Superpowers",
		description:
			"We loved SvelteKit's speed, ease of use, and ability to create standalone apps. It was the perfect platform for building these mini powerhouses."
	},
	{
		title: 'Simplicity is Key',
		description:
			'We believe in clear, focused functionality. No overwhelming interfaces, just the tools you need to tackle your task quickly.'
	},
	{
		title: 'Learning by Doing',
		description:
			'Each mini-app is a mini-lesson in SvelteKit. Beginners can learn by example, while experienced devs can pick up new tricks.'
	}
];

const future = [
	{
		title: 'Building the Ultimate Toolkit',
		description:
			'We want a diverse collection of mini-apps for any situation. What tools do you wish you had?'
	},
	{
		title: 'Community Power',
		description:
			'Imagine a community of Svelte MiniApp creators! We could share ideas, collaborate on tools, and make development even more fun.'
	}
];

const next = [
	{
		title: 'Expanding the Mini-App Collection',
		description:
			'We aim to continuously grow the library with diverse mini-apps. User suggestions and contributions are highly encouraged!'
	},
	{
		title: 'Community Collaboration',
		description:
			'Fostering a community around Svelte MiniApps could be a great way to share knowledge, collaborate on new tools, and accelerate development.'
	}
];

export const load: PageLoad = async () => {
	return {
		features,
		reasons,
		future,
		next
	};
};

// Function to split the description into an array of strings, each containing a maximum number of words
export function _splitDescription(description: string, maxWords: number): string[] {
	const words = description.split(' ');
	const result = [];
	let currentLine = '';

	words.forEach((word) => {
		if ((currentLine + word).split(' ').length <= maxWords) {
			currentLine += ` ${word}`;
		} else {
			result.push(currentLine.trim());
			currentLine = word;
		}
	});

	result.push(currentLine.trim()); // Push the last line

	return result;
}
