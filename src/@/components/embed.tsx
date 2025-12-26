"use client";
import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-react";
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
			className="-m-2 flex gap-2 p-2!"
			onClick={() => copyUrlToClipboard(`/obs/${slug}`)}
			variant="ghost"
		>
			{copy ? (
				<ClipboardCheckIcon className="text-neutral-100" />
			) : (
				<ClipboardCopyIcon />
			)}
			<span className="sr-only text-sm sm:not-sr-only">Embed url</span>
		</Button>
	);
}
