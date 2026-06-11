import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Todo | Secure Personal Todo Manager",
  description: "A secure personal todo application built with Next.js and Strapi CMS, featuring protected routes, strict API ownership, and responsive dark themes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="app-container">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
