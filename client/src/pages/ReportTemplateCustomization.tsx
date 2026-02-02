import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Palette,
  FileText,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Settings,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Section {
  id: number;
  sectionName: string;
  sectionType: string;
  isEnabled: boolean;
  displayOrder: number;
}

export default function ReportTemplateCustomization() {
  const [farms] = trpc.farms.list.useSuspenseQuery();

  const [selectedFarm, setSelectedFarm] = useState<number | null>(farms?.[0]?.id || null);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);

  const [brandingColor, setBrandingColor] = useState("#2563eb");
  const [headerText, setHeaderText] = useState("Farm Report");
  const [footerText, setFooterText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [pageOrientation, setPageOrientation] = useState<"portrait" | "landscape">("portrait");

  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);

  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  // Queries
  const { data: customization, refetch: refetchCustomization } =
    trpc.reportTemplateCustomization.getCustomization.useQuery(
      { templateId: selectedTemplate, farmId: selectedFarm || 0 },
      { enabled: !!selectedTemplate && !!selectedFarm }
    );

  const { data: templateSections, refetch: refetchSections } =
    trpc.reportTemplateCustomization.getTemplateSections.useQuery(
      { templateId: selectedTemplate },
      { enabled: !!selectedTemplate }
    );

  const { data: stats } = trpc.reportTemplateCustomization.getCustomizationStats.useQuery(
    { templateId: selectedTemplate },
    { enabled: !!selectedTemplate }
  );

  // Mutations
  const updateCustomization = trpc.reportTemplateCustomization.updateCustomization.useMutation();
  const updateSectionVisibility = trpc.reportTemplateCustomization.updateSectionVisibility.useMutation();
  const addCustomSection = trpc.reportTemplateCustomization.addCustomSection.useMutation();
  const deleteCustomSection = trpc.reportTemplateCustomization.deleteCustomSection.useMutation();

  const handleSaveCustomization = async () => {
    if (!selectedTemplate || !selectedFarm) return;

    try {
      await updateCustomization.mutateAsync({
        templateId: selectedTemplate,
        farmId: selectedFarm,
        brandingColor,
        headerText,
        footerText,
        logoUrl,
        pageOrientation,
        includeCharts,
        includeMetrics,
        includeRecommendations,
      });

      alert("Customization saved successfully!");
      refetchCustomization();
    } catch (error) {
      alert(`Failed to save customization: ${error}`);
    }
  };

  const handleToggleSectionVisibility = async (sectionId: number, currentState: boolean) => {
    try {
      await updateSectionVisibility.mutateAsync({
        sectionId,
        isEnabled: !currentState,
      });
      refetchSections();
    } catch (error) {
      alert(`Failed to update section: ${error}`);
    }
  };

  const handleAddSection = async () => {
    if (!selectedTemplate || !newSectionName) return;

    try {
      const maxOrder = Math.max(...(templateSections?.map((s: any) => s.displayOrder) || [0]));
      await addCustomSection.mutateAsync({
        templateId: selectedTemplate,
        sectionName: newSectionName,
        customContent: "",
        displayOrder: maxOrder + 1,
      });

      setNewSectionName("");
      setShowAddSection(false);
      refetchSections();
    } catch (error) {
      alert(`Failed to add section: ${error}`);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm("Delete this section?")) return;

    try {
      await deleteCustomSection.mutateAsync({ sectionId });
      refetchSections();
    } catch (error) {
      alert(`Failed to delete section: ${error}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Report Template Customization</h1>
        <p className="text-muted-foreground mt-2">
          Customize report sections, branding, and layout
        </p>
      </div>

      {/* Farm Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Farm</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedFarm?.toString() || ""}
            onValueChange={(value) => setSelectedFarm(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a farm" />
            </SelectTrigger>
            <SelectContent>
              {farms?.map((farm) => (
                <SelectItem key={farm.id} value={farm.id.toString()}>
                  {farm.farmName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Branding & Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Branding & Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Branding Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={brandingColor}
                  onChange={(e) => setBrandingColor(e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={brandingColor}
                  onChange={(e) => setBrandingColor(e.target.value)}
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div>
              <Label>Page Orientation</Label>
              <Select value={pageOrientation} onValueChange={(value: any) => setPageOrientation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Header Text</Label>
              <Input
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="Farm Report"
              />
            </div>

            <div>
              <Label>Footer Text</Label>
              <Input
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="Optional footer"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Logo URL</Label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Content Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={includeCharts}
              onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
            />
            <Label className="cursor-pointer">Include Charts & Visualizations</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={includeMetrics}
              onCheckedChange={(checked) => setIncludeMetrics(checked as boolean)}
            />
            <Label className="cursor-pointer">Include Key Metrics</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={includeRecommendations}
              onCheckedChange={(checked) => setIncludeRecommendations(checked as boolean)}
            />
            <Label className="cursor-pointer">Include Recommendations</Label>
          </div>
        </CardContent>
      </Card>

      {/* Sections Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Report Sections
              </CardTitle>
              <CardDescription>
                Manage which sections appear in your reports
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddSection(!showAddSection)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddSection && (
            <div className="p-4 border rounded-lg bg-secondary/50 space-y-3">
              <div>
                <Label>Section Name</Label>
                <Input
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Summary, Detailed Analysis"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSection}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddSection(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {templateSections && templateSections.length > 0 ? (
            <div className="space-y-2">
              {templateSections.map((section: any) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() =>
                        handleToggleSectionVisibility(section.id, section.isEnabled)
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {section.isEnabled ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="font-semibold">{section.sectionName}</div>
                      <div className="text-sm text-muted-foreground">
                        <Badge variant="outline" className="mr-2">
                          {section.sectionType}
                        </Badge>
                        Order: {section.displayOrder}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {section.sectionType === "custom" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sections available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Customization Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Sections</div>
                <div className="text-2xl font-bold">{stats.totalSections}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.enabledSections} enabled
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Customizations</div>
                <div className="text-2xl font-bold">{stats.totalCustomizations}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.customizationsWithBranding} with branding
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Custom Content</div>
                <div className="text-2xl font-bold">
                  {stats.customizationsWithCustomContent}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  with headers/footers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSaveCustomization} disabled={updateCustomization.isPending}>
          <Save className="w-4 h-4 mr-2" />
          Save Customization
        </Button>
      </div>
    </div>
  );
}
