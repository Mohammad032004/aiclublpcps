import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui";
import ApplicationPopup from "@/components/ApplicationPopup";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: 64 }}>
        {children}
      </main>

      <Footer />

      <ToastContainer />

      <ApplicationPopup />
    </>
  );
}