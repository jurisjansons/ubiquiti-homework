import "~/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";

import { ToastContainer } from "react-toastify";
import { CssBaseline, Container } from "@mui/material";
import ModalContainer from "./_containers/Modal";

import { getServerSession } from "next-auth";
import SessionProvider from "./_components/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Todo",
  description: "Todo App for Ubiquity Homework",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <TRPCReactProvider cookies={cookies().toString()}>
            <CssBaseline />
            <Container
              component="main"
              maxWidth="lg"
              sx={{
                minHeight: "100vh",
              }}
            >
              {children}
            </Container>
            <ModalContainer />
            <ToastContainer position="bottom-center" hideProgressBar={true} />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
