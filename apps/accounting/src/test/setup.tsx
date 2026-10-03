import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
	useRouter: vi.fn(() => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
	})),
	useSearchParams: vi.fn(() => new URLSearchParams()),
	usePathname: vi.fn(() => "/"),
}));

// Mock next/image
vi.mock("next/image", () => ({
	default: (props: any) => {
		// eslint-disable-next-line @next/next/no-img-element
		// biome-ignore lint/performance/noImgElement: mock component
		return <img {...props} alt={props.alt} />;
	},
}));

// Mock ResizeObserver for some UI components
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};
