import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/setup/onboarding-wizard'
import { prisma } from '@/lib/prisma'

export default async function SetupPage() {
  // Check if setup is already completed
  const settings = await prisma.settings.findFirst({
    where: { key: 'setup_completed' },
  })

  if (settings?.value?.completed === true) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <OnboardingWizard />
      </div>
    </div>
  )
}