import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ImageComparisonProps {
  suspectImage: string
  targetImage: string
  similarity: number
}

export function ImageComparison({ suspectImage, targetImage, similarity }: ImageComparisonProps) {
  const getColorClass = (score: number) => {
    if (score >= 80) return "text-destructive"
    if (score >= 60) return "text-warning"
    return "text-muted-foreground"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Image Comparison</CardTitle>
          <Badge variant={similarity >= 80 ? "destructive" : "secondary"} className="text-sm">
            {similarity}% Match
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Suspect</p>
            <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted">
              <img
                src={suspectImage || "/placeholder.svg"}
                alt="Suspect profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Target</p>
            <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted">
              <img
                src={targetImage || "/placeholder.svg"}
                alt="Target profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted">
          <p className="text-sm">
            <span className="font-medium">Analysis:</span>{" "}
            <span className="text-muted-foreground">
              Perceptual hash distance indicates{" "}
              {similarity >= 80 ? "very high" : similarity >= 60 ? "moderate" : "low"} similarity between images.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
