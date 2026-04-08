"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, FileSpreadsheet, FileBadge, Shield, Calendar } from "lucide-react"

interface TaxDocument {
  id: string
  name: string
  type: "receipt" | "statement" | "certificate"
  date: string
  amount?: string
  status: "ready" | "processing" | "pending"
  fileSize: string
}

const documents: TaxDocument[] = [
  {
    id: "1",
    name: "Q1 2026 Donation Receipt",
    type: "receipt",
    date: "Mar 31, 2026",
    amount: "125,000 MXN",
    status: "ready",
    fileSize: "245 KB",
  },
  {
    id: "2",
    name: "Annual Tax Statement 2025",
    type: "statement",
    date: "Jan 15, 2026",
    amount: "485,000 MXN",
    status: "ready",
    fileSize: "1.2 MB",
  },
  {
    id: "3",
    name: "501(c)(3) Verification Letter",
    type: "certificate",
    date: "Jan 1, 2026",
    status: "ready",
    fileSize: "156 KB",
  },
  {
    id: "4",
    name: "Impact Allocation Report 2025",
    type: "statement",
    date: "Feb 28, 2026",
    status: "ready",
    fileSize: "2.8 MB",
  },
  {
    id: "5",
    name: "Q2 2026 Donation Receipt",
    type: "receipt",
    date: "Jun 30, 2026",
    amount: "95,000 MXN",
    status: "processing",
    fileSize: "-- KB",
  },
]

const typeIcons = {
  receipt: FileText,
  statement: FileSpreadsheet,
  certificate: FileBadge,
}

const typeLabels = {
  receipt: "Receipt",
  statement: "Statement",
  certificate: "Certificate",
}

export function TaxDocuments() {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Tax Deductible Documents</CardTitle>
            <CardDescription className="text-sm mt-1">
              Download official documentation for your records
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>IRS Compliant</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/50">
          {documents.map((doc) => {
            const IconComponent = typeIcons[doc.type]
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground leading-none">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {doc.date}
                      </span>
                      {doc.amount && (
                        <>
                          <span className="text-border">|</span>
                          <span className="font-medium text-foreground">{doc.amount}</span>
                        </>
                      )}
                      <span className="text-border">|</span>
                      <span>{doc.fileSize}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={doc.status === "ready" ? "outline" : "secondary"}
                    className={
                      doc.status === "ready"
                        ? "border-green-500/30 bg-green-50 text-green-700 text-xs"
                        : doc.status === "processing"
                        ? "bg-amber-50 text-amber-700 border-amber-500/30 text-xs"
                        : "text-xs"
                    }
                  >
                    {typeLabels[doc.type]}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={doc.status !== "ready"}
                    className="h-8 gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            All documents are digitally signed and verifiable
          </p>
          <Button variant="ghost" size="sm" className="text-xs h-8">
            Request Custom Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
