export default function ThemedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="fixed inset-0 z-50">{children}</div>;
}
