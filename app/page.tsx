import { redirect } from "next/navigation";

export default function HomePage() {
	// Redirect to dashboard when accessing root
	redirect("/dashboard");
}
