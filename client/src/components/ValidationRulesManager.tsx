import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Plus, Trash2, Check } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function ValidationRulesManager() {
  const [rules, setRules] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState({
    entityType: '',
    fieldName: '',
    ruleType: 'required' as const,
    ruleValue: '',
    errorMessage: '',
  });

  const createRuleMutation = trpc.admin.createValidationRule.useMutation();
  const deleteRuleMutation = trpc.admin.deleteValidationRule.useMutation();

  const handleAddRule = async () => {
    if (!newRule.entityType || !newRule.fieldName) {
      alert('Entity type and field name are required');
      return;
    }

    try {
      await createRuleMutation.mutateAsync({
        entityType: newRule.entityType,
        fieldName: newRule.fieldName,
        ruleType: newRule.ruleType,
        ruleValue: newRule.ruleValue,
        errorMessage: newRule.errorMessage,
      });

      setRules([...rules, { id: Date.now(), ...newRule }]);
      setNewRule({ entityType: '', fieldName: '', ruleType: 'required', ruleValue: '', errorMessage: '' });
      setIsAdding(false);
      alert('Validation rule created successfully');
    } catch (error) {
      alert('Failed to create validation rule');
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      await deleteRuleMutation.mutateAsync({ ruleId });
      setRules(rules.filter((r) => r.id !== ruleId));
      alert('Validation rule deleted successfully');
    } catch (error) {
      alert('Failed to delete validation rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Rule Form */}
      {isAdding && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Create New Validation Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Entity Type</Label>
                <Input
                  placeholder="e.g., animal, crop, activity"
                  value={newRule.entityType}
                  onChange={(e) => setNewRule({ ...newRule, entityType: e.target.value })}
                />
              </div>
              <div>
                <Label>Field Name</Label>
                <Input
                  placeholder="e.g., name, age, weight"
                  value={newRule.fieldName}
                  onChange={(e) => setNewRule({ ...newRule, fieldName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rule Type</Label>
                <select
                  value={newRule.ruleType}
                  onChange={(e) => setNewRule({ ...newRule, ruleType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="required">Required</option>
                  <option value="min">Minimum Length</option>
                  <option value="max">Maximum Length</option>
                  <option value="pattern">Pattern</option>
                  <option value="enum">Enum</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <Label>Rule Value</Label>
                <Input
                  placeholder="e.g., 5 for min length"
                  value={newRule.ruleValue}
                  onChange={(e) => setNewRule({ ...newRule, ruleValue: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Error Message</Label>
              <Input
                placeholder="Error message to display"
                value={newRule.errorMessage}
                onChange={(e) => setNewRule({ ...newRule, errorMessage: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRule} disabled={createRuleMutation.isPending}>
                <Check className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      {rules.length === 0 && !isAdding ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No validation rules created yet</p>
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create First Rule
          </Button>
        </div>
      ) : (
        <>
          <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Rule
          </Button>
          <div className="space-y-2">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {rule.entityType}.{rule.fieldName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {rule.ruleType} {rule.ruleValue && `(${rule.ruleValue})`}
                      </p>
                      {rule.errorMessage && (
                        <p className="text-sm text-blue-600 mt-1">{rule.errorMessage}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={deleteRuleMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
