import ThemeProvider from "@/components/theme/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";



const font = Roboto({  weight: ['500', '700','900'],
style: ['normal', 'italic'],
subsets: ['latin'],
display: 'swap'});
export const metadata: Metadata = {
	title: "Telegram Auth",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
			<html lang="en">
				<body className={font.className}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
					>
						<main>{children}</main>
					</ThemeProvider>
				</body>
			</html>
	);
}
