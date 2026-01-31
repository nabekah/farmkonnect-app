import { useState } from "react";
import { trpc } from "../lib/trpc";
import { DataTable } from "../components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  MapPin,
  Sprout,
  Beef,
  ShoppingCart,
  GraduationCap,
  BarChart3,
  Truck,
  Cpu,
  Bell,
} from "lucide-react";
import { format } from "date-fns";

export default function DataManagement() {
  const [selectedModule, setSelectedModule] = useState("farms");
  const [detailsDialog, setDetailsDialog] = useState<{open: boolean, data: any, type: string}>({
    open: false,
    data: null,
    type: "",
  });

  // Farms Data
  const { data: farms = [], refetch: refetchFarms } = trpc.farms.list.useQuery();
  // Note: Farm deletion handled through farms router

  const farmsColumns: ColumnDef<any>[] = [
    {
      accessorKey: "farmName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Farm Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "farmType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("farmType")}</Badge>
      ),
    },
    {
      accessorKey: "farmSize",
      header: "Size (ha)",
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {row.getValue("location")}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM dd, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const farm = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setDetailsDialog({ open: true, data: farm, type: "farm" })}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="text-muted-foreground"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete (Not Available)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Crops Data
  const { data: crops = [], refetch: refetchCrops } = trpc.crops.list.useQuery();

  const cropsColumns: ColumnDef<any>[] = [
    {
      accessorKey: "cropName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Crop Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "variety",
      header: "Variety",
    },
    {
      accessorKey: "plantingDate",
      header: "Planting Date",
      cell: ({ row }) => {
        const date = row.getValue("plantingDate");
        return date ? format(new Date(date as string), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      accessorKey: "expectedHarvestDate",
      header: "Expected Harvest",
      cell: ({ row }) => {
        const date = row.getValue("expectedHarvestDate");
        return date ? format(new Date(date as string), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "harvested" ? "default" : 
                       status === "growing" ? "secondary" : "outline";
        return <Badge variant={variant as any}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const crop = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setDetailsDialog({ open: true, data: crop, type: "crop" })}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="text-muted-foreground"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete (Not Available)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Livestock Data
  const { data: animals = [], refetch: refetchAnimals } = trpc.animals.list.useQuery({ farmId: 0 });

  const livestockColumns: ColumnDef<any>[] = [
    {
      accessorKey: "animalType",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "breed",
      header: "Breed",
    },
    {
      accessorKey: "tagNumber",
      header: "Tag Number",
    },
    {
      accessorKey: "age",
      header: "Age (months)",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "healthy" ? "default" : 
                       status === "sick" ? "destructive" : "secondary";
        return <Badge variant={variant as any}>{status}</Badge>;
      },
    },
    {
      accessorKey: "acquisitionDate",
      header: "Acquired",
      cell: ({ row }) => format(new Date(row.getValue("acquisitionDate")), "MMM dd, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const animal = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setDetailsDialog({ open: true, data: animal, type: "animal" })}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="text-muted-foreground"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete (Not Available)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Marketplace Products Data
  const { data: products = [], refetch: refetchProducts } = trpc.marketplace.listProducts.useQuery({ category: undefined });
  const deleteProduct = trpc.marketplace.deleteProduct.useMutation({
    onSuccess: () => refetchProducts(),
  });

  const productsColumns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        return `GH₵${price.toFixed(2)}`;
      },
    },
    {
      accessorKey: "stockQuantity",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("stockQuantity") as number;
        const variant = stock > 10 ? "default" : stock > 0 ? "secondary" : "destructive";
        return <Badge variant={variant as any}>{stock}</Badge>;
      },
    },
    {
      accessorKey: "unit",
      header: "Unit",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setDetailsDialog({ open: true, data: product, type: "product" })}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (confirm("Are you sure you want to delete this product?")) {
                    deleteProduct.mutate({ id: product.id });
                  }
                }}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Training Programs Data
  const { data: trainingPrograms = [], refetch: refetchTraining } = trpc.training.programs.list.useQuery();
  const deleteProgram = trpc.training.programs.delete.useMutation({
    onSuccess: () => refetchTraining(),
  });

  const trainingColumns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Program Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
    },
    {
      accessorKey: "level",
      header: "Level",
    },
    {
      accessorKey: "maxParticipants",
      header: "Max Participants",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const program = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setDetailsDialog({ open: true, data: program, type: "training" })}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (confirm("Are you sure you want to delete this program?")) {
                    deleteProgram.mutate({ id: program.id });
                  }
                }}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // IoT Devices Data
  const { data: devices = [], refetch: refetchDevices } = trpc.iot.listDevices.useQuery({ farmId: 0 });
  // Note: IoT device deletion not available in current router

  const devicesColumns: ColumnDef<any>[] = [
    {
      accessorKey: "deviceName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Device Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "deviceType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("deviceType")}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "active" ? "default" : 
                       status === "inactive" ? "secondary" : "destructive";
        return <Badge variant={variant as any}>{status}</Badge>;
      },
    },
    {
      accessorKey: "lastReading",
      header: "Last Reading",
      cell: ({ row }) => {
        const date = row.getValue("lastReading");
        return date ? format(new Date(date as string), "MMM dd, HH:mm") : "Never";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const device = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setDetailsDialog({ open: true, data: device, type: "device" })}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="text-muted-foreground"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete (Not Available)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Management</h1>
        <p className="text-muted-foreground">
          View, edit, and manage all your agricultural data in one place
        </p>
      </div>

      {/* Module Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setSelectedModule("farms")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Badge variant="secondary">{farms.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Farms</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => setSelectedModule("crops")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Sprout className="h-5 w-5 text-muted-foreground" />
              <Badge variant="secondary">{crops.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Crops</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => setSelectedModule("livestock")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Beef className="h-5 w-5 text-muted-foreground" />
              <Badge variant="secondary">{animals.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Livestock</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => setSelectedModule("products")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <Badge variant="secondary">{products.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Products</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => setSelectedModule("training")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <Badge variant="secondary">{trainingPrograms.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Training</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => setSelectedModule("devices")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Cpu className="h-5 w-5 text-muted-foreground" />
              <Badge variant="secondary">{devices.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">IoT Devices</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedModule === "farms" && "Farms Management"}
            {selectedModule === "crops" && "Crops Management"}
            {selectedModule === "livestock" && "Livestock Management"}
            {selectedModule === "products" && "Products Management"}
            {selectedModule === "training" && "Training Programs Management"}
            {selectedModule === "devices" && "IoT Devices Management"}
          </CardTitle>
          <CardDescription>
            View, filter, sort, and manage your {selectedModule} data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedModule === "farms" && (
            <DataTable
              columns={farmsColumns}
              data={farms}
              searchPlaceholder="Search farms..."
              exportFilename="farms"
            />
          )}
          {selectedModule === "crops" && (
            <DataTable
              columns={cropsColumns}
              data={crops}
              searchPlaceholder="Search crops..."
              exportFilename="crops"
            />
          )}
          {selectedModule === "livestock" && (
            <DataTable
              columns={livestockColumns}
              data={animals}
              searchPlaceholder="Search animals..."
              exportFilename="livestock"
            />
          )}
          {selectedModule === "products" && (
            <DataTable
              columns={productsColumns}
              data={products}
              searchPlaceholder="Search products..."
              exportFilename="products"
            />
          )}
          {selectedModule === "training" && (
            <DataTable
              columns={trainingColumns}
              data={trainingPrograms}
              searchPlaceholder="Search programs..."
              exportFilename="training-programs"
            />
          )}
          {selectedModule === "devices" && (
            <DataTable
              columns={devicesColumns}
              data={devices}
              searchPlaceholder="Search devices..."
              exportFilename="iot-devices"
            />
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailsDialog.type === "farm" && "Farm Details"}
              {detailsDialog.type === "crop" && "Crop Details"}
              {detailsDialog.type === "animal" && "Animal Details"}
              {detailsDialog.type === "product" && "Product Details"}
              {detailsDialog.type === "training" && "Training Program Details"}
              {detailsDialog.type === "device" && "Device Details"}
            </DialogTitle>
            <DialogDescription>
              Complete information about this record
            </DialogDescription>
          </DialogHeader>
          {detailsDialog.data && (
            <div className="space-y-4">
              {Object.entries(detailsDialog.data).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-4">
                  <div className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</div>
                  <div className="col-span-2">
                    {value instanceof Date
                      ? format(value, "PPP")
                      : typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
