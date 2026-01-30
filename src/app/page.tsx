import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing/components/landing-page";

const Home = async () => {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return <LandingPage />;
};

export default Home;
