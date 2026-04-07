import { Navigation } from "@/components/Navigation"
import { Hero } from "@/components/Hero"
import { MissionsGrid } from "@/components/MissionsGrid"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <MissionsGrid />
      </main>
      <Footer />
    </div>
  )
}
