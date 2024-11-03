import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { AdminSetup } from './steps/admin-setup'
import { DatabaseSetup } from './steps/database-setup'
import { AppSettings } from './steps/app-settings'
import { RolesSetup } from './steps/roles-setup'
import { EmailSetup } from './steps/email-setup'
import { CompletionStep } from './steps/completion'

const STEPS = [
  { id: 'admin', title: 'Admin Account' },
  { id: 'database', title: 'Database' },
  { id: 'settings', title: 'Application Settings' },
  { id: 'roles', title: 'User Roles' },
  { id: 'email', title: 'Email Settings' },
  { id: 'complete', title: 'Complete' },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const router = useRouter()
  const { toast } = useToast()

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = async (stepData: any) => {
    try {
      // Save step data
      await fetch('/api/setup/step', {
        method: 'POST',
        body: JSON.stringify({
          step: STEPS[currentStep].id,
          data: stepData,
        }),
      })

      // Update form data
      setFormData((prev) => ({
        ...prev,
        [STEPS[currentStep].id]: stepData,
      }))

      // Move to next step
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1)
      } else {
        // Complete setup
        await fetch('/api/setup/complete', { method: 'POST' })
        router.push('/admin')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Setup Your Application</h1>
        <p className="text-gray-500 mt-2">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="p-6">
        {currentStep === 0 && (
          <AdminSetup onNext={handleNext} />
        )}
        {currentStep === 1 && (
          <DatabaseSetup 
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 2 && (
          <AppSettings 
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <RolesSetup 
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && (
          <EmailSetup 
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 5 && (
          <CompletionStep 
            onComplete={handleNext}
            onBack={handleBack}
          />
        )}
      </Card>
    </div>
  )
}