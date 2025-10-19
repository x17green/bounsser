import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, ExternalLink } from "lucide-react"

interface EventCardProps {
  suspectHandle: string
  suspectAvatar?: string
  targetHandle: string
  confidence: number
  timestamp: string
  signals: string[]
  status: "pending" | "reviewed" | "flagged" | "dismissed"
}

export function EventCard({
  suspectHandle,
  suspectAvatar,
  targetHandle,
  confidence,
  timestamp,
  signals,
  status,
}: EventCardProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-destructive"
    if (score >= 50) return "text-warning"
    return "text-muted-foreground"
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      reviewed: "outline",
      flagged: "destructive",
      dismissed: "default",
    }
    return variants[status] || "default"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={suspectAvatar || "/placeholder.svg"} />
              <AvatarFallback>{suspectHandle[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">@{suspectHandle}</span>
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <div className="text-sm text-muted-foreground">
                Impersonating <span className="text-foreground font-medium">@{targetHandle}</span>
              </div>
            </div>
          </div>
          <Badge variant={getStatusBadge(status)} className="capitalize">
            {status}
          </Badge>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Confidence Score</div>
            <div className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}>{confidence}%</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-2">Detection Signals</div>
            <div className="flex flex-wrap gap-2">
              {signals.map((signal, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {signal}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          <Button variant="ghost" size="sm">
            View Details
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
