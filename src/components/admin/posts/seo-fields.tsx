import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SEOAnalyzer } from '@/components/seo/seo-analyzer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { generateOpenGraph, generateSchemaOrg } from '@/lib/seo/generate'

interface SEOFieldsProps {
  form: UseFormReturn<any>
  baseUrl: string
}

export function SEOFields({ form, baseUrl }: SEOFieldsProps) {
  const [activeTab, setActiveTab] = useState('basic')

  const watchedValues = {
    title: form.watch('seo.title'),
    description: form.watch('seo.description'),
    keywords: form.watch('seo.keywords'),
    content: form.watch('content'),
  }

  const handleGenerateMetadata = () => {
    const post = form.getValues()
    const openGraph = generateOpenGraph(post, baseUrl)
    const schemaOrg = generateSchemaOrg(post, {
      name: process.env.NEXT_PUBLIC_SITE_NAME!,
      logo: process.env.NEXT_PUBLIC_SITE_LOGO,
    }, baseUrl)

    form.setValue('seo.openGraph', openGraph)
    form.setValue('seo.schema', schemaOrg)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Basic SEO</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="schema">Schema.org</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="seo.title">SEO Title</Label>
            <Input
              id="seo.title"
              {...form.register('seo.title')}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              {watchedValues.title?.length || 0}/60 characters
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seo.description">Meta Description</Label>
            <Textarea
              id="seo.description"
              {...form.register('seo.description')}
              className="font-mono h-20"
            />
            <p className="text-sm text-muted-foreground">
              {watchedValues.description?.length || 0}/155 characters
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seo.keywords">Focus Keywords</Label>
            <Input
              id="seo.keywords"
              {...form.register('seo.keywords')}
              placeholder="Separate keywords with commas"
            />
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card className="p-4">
            <Button
              type="button"
              onClick={handleGenerateMetadata}
              className="mb-4"
            >
              Generate Open Graph Tags
            </Button>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Open Graph Title</Label>
                <Input {...form.register('seo.openGraph.title')} />
              </div>

              <div className="grid gap-2">
                <Label>Open Graph Description</Label>
                <Textarea {...form.register('seo.openGraph.description')} />
              </div>

              <div className="grid gap-2">
                <Label>Open Graph Image</Label>
                <Input {...form.register('seo.openGraph.image')} type="url" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card className="p-4">
            <Button
              type="button"
              onClick={handleGenerateMetadata}
              className="mb-4"
            >
              Generate Schema.org Markup
            </Button>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Article Type</Label>
                <Input
                  {...form.register('seo.schema.@type')}
                  defaultValue="Article"
                />
              </div>

              <div className="grid gap-2">
                <Label>Author Name</Label>
                <Input {...form.register('seo.schema.author.name')} />
              </div>

              <div className="grid gap-2">
                <Label>Publisher Organization</Label>
                <Input {...form.register('seo.schema.publisher.name')} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <SEOAnalyzer
            title={watchedValues.title || ''}
            description={watchedValues.description || ''}
            content={watchedValues.content || ''}
            keywords={
              watchedValues.keywords
                ? watchedValues.keywords.split(',').map(k => k.trim())
                : []
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}