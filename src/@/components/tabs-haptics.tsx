"use client";

import { ClipboardList, Trophy, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useHaptics } from "~/@/hooks/use-haptics";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "~/@/components/ui/tabs";

type IconName = "users" | "clipboard-list" | "trophy";

const iconMap = {
	users: Users,
	"clipboard-list": ClipboardList,
	trophy: Trophy,
} as const;

interface TabConfig {
	value: string;
	label: string;
	icon: IconName;
	content: React.ReactNode;
}

interface TabsWithHapticsProps {
	className?: string;
	defaultValue: string;
	tabs: TabConfig[];
}

const tabContentVariants = {
	initial: { opacity: 0, y: 8, scale: 0.98 },
	animate: { opacity: 1, y: 0, scale: 1 },
	exit: { opacity: 0, y: -8, scale: 0.98 },
};

export default function TabsWithHaptics({
	className,
	defaultValue,
	tabs,
}: TabsWithHapticsProps) {
	const [activeTab, setActiveTab] = useState(defaultValue);
	const { feedback } = useHaptics();

	const handleTabChange = (value: string) => {
		feedback("selection");
		setActiveTab(value);
	};

	return (
		<Tabs className={className} value={activeTab} onValueChange={handleTabChange}>
			<TabsList className="relative mb-2 grid h-auto w-full grid-cols-3">
				{tabs.map((tab) => {
					const Icon = iconMap[tab.icon];
					const isActive = activeTab === tab.value;
					return (
						<TabsTrigger
							key={tab.value}
							className="relative data-active:bg-transparent data-active:text-primary dark:data-active:bg-transparent dark:data-active:text-primary"
							value={tab.value}
						>
							{isActive && (
								<motion.div
									className="absolute inset-0 rounded-md bg-primary/20"
									layoutId="activeTabIndicator"
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 30,
									}}
								/>
							)}
							<motion.div
								className="relative z-10 flex items-center justify-center gap-2"
								whileTap={{ scale: 0.95 }}
								transition={{ duration: 0.1 }}
							>
								<Icon className="size-4" />
								<span className="hidden sm:block">{tab.label}</span>
							</motion.div>
						</TabsTrigger>
					);
				})}
			</TabsList>
			<AnimatePresence mode="wait">
				{tabs.map(
					(tab) =>
						activeTab === tab.value && (
							<TabsContent
								key={tab.value}
								className="space-y-5"
								value={tab.value}
								forceMount
							>
								<motion.div
									variants={tabContentVariants}
									initial="initial"
									animate="animate"
									exit="exit"
									transition={{
										type: "spring",
										stiffness: 300,
										damping: 25,
									}}
								>
									{tab.content}
								</motion.div>
							</TabsContent>
						),
				)}
			</AnimatePresence>
		</Tabs>
	);
}
