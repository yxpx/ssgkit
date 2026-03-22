import "./globals.css";

export const metadata = {
  title: "SSGKit Studio Dashboard",
  description: "Create a premium static portfolio with a simple visual form."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
