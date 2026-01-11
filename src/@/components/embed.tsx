"use client";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/@/components/ui/button";

export function Embed({ slug }: { slug: string }) {
	const [copy, setCopy] = useState(false);
	const copyUrlToClipboard = (path: string) => {
		setCopy(true);
		void navigator.clipboard.writeText(`${window.location.origin}${path}`);
		setTimeout(() => setCopy(false), 1000);
		toast.info("Linkki kopioitu leikepöydälle");
	};
	return (
		<Button
			className="w-full gap-2 transition-all duration-200 hover:scale-[1.02]"
			onClick={() => copyUrlToClipboard(`/obs/${slug}`)}
			variant="secondary"
		>
			{copy ? (
				<CheckIcon className="size-4" />
			) : (
				<CopyIcon className="size-4" />
			)}
			<span className="sr-only text-sm sm:not-sr-only">
				{copy ? "Kopioitu!" : "Kopioi linkki"}
			</span>
		</Button>
	);
}
