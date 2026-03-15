"use client";

import { ClipboardList, Trophy, Users } from "lucide-react";
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
			<TabsList className="mb-2 grid h-auto w-full grid-cols-3">
				{tabs.map((tab) => {
					const Icon = iconMap[tab.icon];
					return (
						<TabsTrigger
							key={tab.value}
							className="data-active:bg-primary/30 data-active:text-primary dark:data-active:bg-primary/30 dark:data-active:text-primary"
							value={tab.value}
						>
							<div className="flex items-center justify-center gap-2">
								<Icon className="size-4" />
								<span className="hidden sm:block">{tab.label}</span>
							</div>
						</TabsTrigger>
					);
				})}
			</TabsList>
			{tabs.map((tab) => (
				<TabsContent
					key={tab.value}
					className="fade-in-50 animate-in space-y-5 duration-300"
					value={tab.value}
				>
					{tab.content}
				</TabsContent>
			))}
		</Tabs>
	);
}
