import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, DollarSign, TrendingUp } from "lucide-react";

const FEED_TYPES = [
  "Hay",
  "Grain",
  "Silage",
  "Pasture",
  "Pellets",
  "Supplement",
  "Other",
];

export function FeedingRecords({ animalId }: { animalId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedType, setFeedType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [feedDate, setFeedDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: records = [], refetch } = trpc.feeding.listByAnimal.useQuery({ animalId });
  const { data: costAnalysis } = trpc.feeding.getCostAnalysis.useQuery({
    animalId,
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  const { data: nutritionSummary } = trpc.feeding.getNutritionalSummary.useQuery({ animalId, days: 30 });

  const createMutation = trpc.feeding.record.useMutation();
  const deleteMutation = trpc.feeding.delete.useMutation();

  const handleAddRecord = async () => {
    if (!feedType || !quantity) return;

    await createMutation.mutateAsync({
      animalId,
      feedDate: new Date(feedDate),
      feedType,
      quantityKg: parseFloat(quantity),
      notes: notes || undefined,
    });

    setFeedType("");
    setQuantity("");
    setNotes("");
    setFeedDate(new Date().toISOString().split("T")[0]);
    setIsOpen(false);
    refetch();
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Feeding Records</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Feeding Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feed-date">Date</Label>
                <Input
                  id="feed-date"
                  type="date"
                  value={feedDate}
                  onChange={(e) => setFeedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="feed-type">Feed Type</Label>
                <Select value={feedType} onValueChange={setFeedType}>
                  <SelectTrigger id="feed-type">
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEED_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes about the feeding..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleAddRecord} className="w-full">
                Save Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cost Analysis Summary */}
      {costAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Analysis (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Quantity</p>
                <p className="text-2xl font-bold">{costAnalysis.totalQuantity.toFixed(1)} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${costAnalysis.totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost per Day</p>
                <p className="text-2xl font-bold">${costAnalysis.costPerDay.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutritional Summary */}
      {nutritionSummary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Nutritional Summary (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Average Daily Intake</p>
                <p className="text-lg font-semibold">{nutritionSummary.avgDailyIntake.toFixed(2)} kg/day</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Feed Type Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(nutritionSummary.feedTypeBreakdown).map(([type, qty]) => (
                    <Badge key={type} variant="outline">
                      {type}: {(qty as number).toFixed(1)} kg
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feeding Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Records</CardTitle>
          <CardDescription>Last 10 feeding records</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No feeding records yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Feed Type</TableHead>
                    <TableHead>Quantity (kg)</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-10">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 10).map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">
                        {new Date(record.feedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">{record.feedType}</TableCell>
                      <TableCell className="text-sm">{parseFloat(record.quantityKg).toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
