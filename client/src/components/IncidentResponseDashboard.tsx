import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";

interface IncidentResponseDashboardProps {
  farmId: string;
}

export const IncidentResponseDashboard: React.FC<IncidentResponseDashboardProps> = ({ farmId }) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState<number | null>(null);

  const { data: playbooks = [] } = trpc.incidentPlaybooks.getPlaybooks.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  const { data: activeIncidents = [] } = trpc.incidentPlaybooks.getActiveIncidents.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  const escalateIncidentMutation = trpc.incidentPlaybooks.escalateIncident.useMutation();
  const resolveIncidentMutation = trpc.incidentPlaybooks.resolveIncident.useMutation();

  const handleEscalateIncident = async (incidentId: number) => {
    try {
      await escalateIncidentMutation.mutateAsync({
        incidentId,
        escalationReason: "Manual escalation by admin"
      });
    } catch (error) {
      console.error("Error escalating incident:", error);
    }
  };

  const handleResolveIncident = async (incidentId: number) => {
    try {
      await resolveIncidentMutation.mutateAsync({
        incidentId,
        resolutionNotes: "Incident resolved"
      });
    } catch (error) {
      console.error("Error resolving incident:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "triggered":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "escalated":
        return <AlertTriangle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            <AlertCircle className="h-4 w-4 mr-2" />
            Active Incidents ({activeIncidents.length})
          </TabsTrigger>
          <TabsTrigger value="playbooks">
            <Zap className="h-4 w-4 mr-2" />
            Playbooks ({playbooks.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Incidents Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeIncidents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No active incidents</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeIncidents.map((incident: any) => (
                <Card key={incident.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(incident.status)}
                          <h3 className="font-semibold">{incident.playbookName}</h3>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{incident.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{incident.triggerReason}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Level {incident.currentEscalationLevel}</span>
                          <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {incident.status !== "resolved" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEscalateIncident(incident.id)}
                              disabled={escalateIncidentMutation.isPending}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Escalate
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleResolveIncident(incident.id)}
                              disabled={resolveIncidentMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Playbooks Tab */}
        <TabsContent value="playbooks" className="space-y-4">
          {playbooks.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Zap className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No incident playbooks created yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {playbooks.map((playbook: any) => (
                <Card key={playbook.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4" />
                          <h3 className="font-semibold">{playbook.playbookName}</h3>
                          <Badge className={getSeverityColor(playbook.severity)}>
                            {playbook.severity.toUpperCase()}
                          </Badge>
                          {playbook.isActive && (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{playbook.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Type: {playbook.incidentType}</span>
                          <span>Created: {new Date(playbook.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPlaybook(playbook.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
