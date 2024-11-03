import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface SEOAnalyzerProps {
  title: string
  description: string
  content: string
  keywords: string[]
}

export function SEOAnalyzer({
  title,
  description,
  content,
  keywords,
}: SEOAnalyzerProps) {
  const [score, setScore] = useState(() => analyzeContent({
    title,
    description,
    content,
    keywords,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          SEO Score
          <Badge variant={score.overall >= 80 ? 'success' : 'warning'}>
            {score.overall}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={score.overall} className="h-2" />

        <div className="space-y-2">
          {score.checks.map((check) => (
            <div
              key={check.id}
              className="flex items-start gap-2 text-sm"
            >
              {check.passed ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-1" />
              )}
              <div>
                <p className="font-medium">{check.name}</p>
                <p className="text-muted-foreground">{check.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface SEOScore {
  overall: number
  checks: Array<{
    id: string
    name: string
    passed: boolean
    message: string
    score: number
  }>
}

function analyzeContent({
  title,
  description,
  content,
  keywords,
}: SEOAnalyzerProps): SEOScore {
  const checks = [
    {
      id: 'title-length',
      name: 'Title Length',
      passed: title.length >= 30 && title.length <= 60,
      message: title.length < 30
        ? 'Title is too short (recommended: 30-60 characters)'
        : title.length > 60
        ? 'Title is too long (recommended: 30-60 characters)'
        : 'Title length is optimal',
      score: title.length >= 30 && title.length <= 60 ? 100 : 50,
    },
    {
      id: 'description-length',
      name: 'Meta Description',
      passed: description.length >= 120 && description.length <= 155,
      message: description.length < 120
        ? 'Description is too short (recommended: 120-155 characters)'
        : description.length > 155
        ? 'Description is too long (recommended: 120-155 characters)'
        : 'Description length is optimal',
      score: description.length >= 120 && description.length <= 155 ? 100 : 50,
    },
    {
      id: 'keyword-density',
      name: 'Keyword Density',
      passed: checkKeywordDensity(content, keywords),
      message: checkKeywordDensity(content, keywords)
        ? 'Keyword density is optimal'
        : 'Improve keyword usage in content',
      score: checkKeywordDensity(content, keywords) ? 100 : 60,
    },
    {
      id: 'content-length',
      name: 'Content Length',
      passed: content.length >= 300,
      message: content.length < 300
        ? 'Content is too short (recommended: minimum 300 words)'
        : 'Content length is good',
      score: content.length >= 300 ? 100 : 40,
    },
  ]

  const overall = Math.round(
    checks.reduce((sum, check) => sum + check.score, 0) / checks.length
  )

  return { overall, checks }
}

function checkKeywordDensity(content: string, keywords: string[]): boolean {
  const words = content.toLowerCase().split(/\s+/)
  const totalWords = words.length

  return keywords.some(keyword => {
    const keywordCount = words.filter(word => word === keyword.toLowerCase()).length
    const density = (keywordCount / totalWords) * 100
    return density >= 0.5 && density <= 2.5
  })
}