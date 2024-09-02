import { Lato } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const lato = Lato({ weight: ['100', '300', '400', '700', '900'], subsets: ["latin"] });

export const metadata = {
  title: "SyncSphere",
  description: "Seamlessly integrate collaboration and data flow with a unified, dynamic platform.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={lato.className}>
          {/* <SignedOut>
            <SignInButton/>
          </SignedOut>
          <SignedIn>
            <UserButton/>
          </SignedIn> */}
          {children}
        </body>
      </html>
    </ClerkProvider>
    
  );
}
