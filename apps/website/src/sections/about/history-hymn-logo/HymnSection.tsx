"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "../../../components/section-header";

const hymnLines = [
	"Mother Perpetua Parochial School in Mauban",
	"Gladly we sing to you.",
	"On your ideals we do stand",
	"Love, discipline, knowledge we gain",
	"We will strive for betterment for our Lord, our country and dear parents.",
	"",
	"Refrain:",
	"Lu, lu, lu, lu",
	"United we now sing, praise gratitude we bring,",
	"Hail to MPPSI, our Alma Mater dear,",
	"Thanks be to our school, our principal, and all our teachers,",
	"Partners of our parents in teaching us to love and share.",
	"Yes, we will do the best we can to our God and fellowmen,",
	"And hope that our dreams will be fulfilled.",
];

export function HymnSection() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [heights, setHeights] = useState<number[]>(Array(24).fill(4));

	// Toggle audio play/pause
	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}
		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
		} else {
			audio.play().then(() => setIsPlaying(true));
		}
	};

	// Real-time pulsating visualizer animation driven by React state
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isPlaying) {
			interval = setInterval(() => {
				setHeights(
					Array.from({ length: 24 }, () => Math.floor(Math.random() * 32 + 6)),
				);
			}, 100);
		} else {
			// Return to resting position gently
			setHeights(Array(24).fill(4));
		}
		return () => clearInterval(interval);
	}, [isPlaying]);

	// Audio time & progress tracking
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const updateProgress = () => {
			if (audio.duration > 0) {
				setProgress(audio.currentTime / audio.duration);
			}
		};

		const handleEnded = () => setIsPlaying(false);
		audio.addEventListener("timeupdate", updateProgress);
		audio.addEventListener("ended", handleEnded);
		return () => {
			audio.removeEventListener("timeupdate", updateProgress);
			audio.removeEventListener("ended", handleEnded);
		};
	}, []);


	return (
		<SectionWrapper className="text-center" width="7xl">
			<SectionHeader title="Our School Hymn" />

			{/* Single Unified Elegant Card */}
			<div className="mx-auto max-w-5xl rounded-3xl border border-gray-150 bg-white p-8 md:p-12 shadow-md hover:shadow-lg transition-all duration-300">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
					{/* Left Column: Player Controls (No nested cards!) */}
					<div className="flex flex-col items-center justify-center gap-6 md:col-span-5 py-4">
						{/* Glowing Play/Pause Button */}
						<button
							className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-200 hover:bg-primary/95"
							type="button"
							aria-label={isPlaying ? "Pause school hymn" : "Play school hymn"}
							onClick={togglePlay}
						>
							{isPlaying ? (
								<Pause className="h-10 w-10 text-white fill-current" />
							) : (
								<Play className="h-10 w-10 text-white fill-current translate-x-0.5" />
							)}
						</button>

						{/* Title / Description */}
						<div className="text-center">
							<h4 className="font-bold text-xl text-gray-800">
								MPPSI School Hymn
							</h4>
							<p className="text-sm text-gray-500 mt-1">
								Official Anthem of Mother Perpetua Parochial School
							</p>
						</div>

						{/* Active Audio Pulsating Waveform */}
						<div className="flex h-12 w-full max-w-xs items-center justify-center gap-1 px-4">
							{heights.map((h, idx) => (
								<div
									className="w-1 rounded-full bg-primary/80 transition-all duration-100 ease-out"
									key={idx}
									style={{ height: `${h}px` }}
								/>
							))}
						</div>

						{/* Native seek control supports pointer and keyboard input. */}
						<input type="range" aria-label="School hymn playback position" min={0} max={1000} step={1} value={Math.round(progress * 1000)} className="h-2 w-full max-w-xs cursor-pointer accent-primary" onChange={(event) => {
							const audio = audioRef.current;
							if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
							const nextProgress = Number(event.currentTarget.value) / 1000;
							audio.currentTime = nextProgress * audio.duration;
							setProgress(nextProgress);
						}} />
					</div>

					{/* Vertical Divider (Desktop Only) */}
					<div className="hidden md:block md:col-span-1 h-72 w-px bg-gray-150 justify-self-center" />

					{/* Right Column: Lyrics Elegant Sheet (No nested cards!) */}
					<div className="font-serif text-base leading-relaxed text-gray-700 sm:text-lg md:col-span-6">
						{hymnLines.map((line, idx) => {
							if (!line.trim()) {
								return (
									<div
										className="my-4 border-b border-dashed border-gray-150"
										key={idx}
									/>
								);
							}
							if (line === "Refrain:") {
								return (
									<p
										className="text-center font-extrabold text-primary text-base sm:text-lg uppercase tracking-widest mb-2"
										key={idx}
									>
										{line}
									</p>
								);
							}
							if (line.startsWith("Lu, lu")) {
								return (
									<p
										className="text-center font-bold text-primary italic text-sm sm:text-base leading-relaxed mb-1"
										key={idx}
									>
										{line}
									</p>
								);
							}
							return (
								<p
									className="text-center text-gray-700 tracking-wide hover:text-primary transition-colors duration-200"
									key={idx}
								>
									{line}
								</p>
							);
						})}
					</div>
				</div>
			</div>

			<audio ref={audioRef} src="/mppsi-hymn.mp3" />
		</SectionWrapper>
	);
}
