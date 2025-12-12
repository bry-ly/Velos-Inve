"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconBox,
  IconCheck,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  ReorderSuggestion,
  ReorderRuleRecord,
} from "@/lib/action/reorder";
import {
  createReorderRule,
  deleteReorderRule,
  toggleReorderRule,
  updateReorderRule,
} from "@/lib/action/reorder";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
}

interface Supplier {
  id: string;
  name: string;
}

interface ReorderDashboardProps {
  suggestions: ReorderSuggestion[];
  rules: ReorderRuleRecord[];
  products: Product[];
  suppliers: Supplier[];
  stats: {
    totalRules: number;
    activeRules: number;
    pendingSuggestions: number;
    criticalItems: number;
  };
}

export function ReorderDashboard({
  suggestions: initialSuggestions,
  rules: initialRules,
  products,
  suppliers,
  stats,
}: ReorderDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"suggestions" | "rules">(
    "suggestions"
  );
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [editingRule, setEditingRule] =
    React.useState<ReorderRuleRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [formProductId, setFormProductId] = React.useState("");
  const [formReorderPoint, setFormReorderPoint] = React.useState("");
  const [formReorderQuantity, setFormReorderQuantity] = React.useState("");
  const [formSupplierId, setFormSupplierId] = React.useState("");
  const [formIsActive, setFormIsActive] = React.useState(true);

  const resetForm = () => {
    setFormProductId("");
    setFormReorderPoint("");
    setFormReorderQuantity("");
    setFormSupplierId("");
    setFormIsActive(true);
  };

  const openEditDialog = (rule: ReorderRuleRecord) => {
    setEditingRule(rule);
    setFormProductId(rule.productId);
    setFormReorderPoint(String(rule.reorderPoint));
    setFormReorderQuantity(String(rule.reorderQuantity));
    setFormSupplierId(rule.supplierId || "");
    setFormIsActive(rule.isActive);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formData = new FormData();

    if (editingRule) {
      formData.append("id", editingRule.id);
    }
    formData.append("productId", formProductId);
    formData.append("reorderPoint", formReorderPoint);
    formData.append("reorderQuantity", formReorderQuantity);
    if (formSupplierId) {
      formData.append("supplierId", formSupplierId);
    }
    formData.append("isActive", String(formIsActive));

    try {
      const result = editingRule
        ? await updateReorderRule(formData)
        : await createReorderRule(formData);

      if (result.success) {
        toast.success(result.message);
        setShowCreateDialog(false);
        setEditingRule(null);
        resetForm();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const formData = new FormData();
    formData.append("id", id);

    const result = await deleteReorderRule(formData);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleToggle = async (id: string) => {
    const result = await toggleReorderRule(id);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const getUrgencyBadge = (urgency: "critical" | "warning" | "normal") => {
    switch (urgency) {
      case "critical":
        return (
          <Badge variant="destructive" className="gap-1">
            <IconAlertTriangle className="h-3 w-3" />
            Critical
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="outline"
            className="gap-1 text-yellow-600 border-yellow-600"
          >
            <IconAlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <IconCheck className="h-3 w-3" />
            Normal
          </Badge>
        );
    }
  };

  // Products without existing rules (for create form)
  const availableProducts = products.filter(
    (p) => !initialRules.some((r) => r.productId === p.id)
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRules}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalRules} total rules
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pendingSuggestions}
            </div>
            <p className="text-xs text-muted-foreground">items need reorder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4 text-red-500" />
              Critical Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.criticalItems}
            </div>
            <p className="text-xs text-muted-foreground">
              urgent restock needed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.length > 0
                ? Math.round((stats.totalRules / products.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">products with rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b">
        <button
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "suggestions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("suggestions")}
        >
          <IconShoppingCart className="inline-block h-4 w-4 mr-1" />
          Reorder Suggestions ({initialSuggestions.length})
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "rules"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("rules")}
        >
          <IconSettings className="inline-block h-4 w-4 mr-1" />
          Reorder Rules ({initialRules.length})
        </button>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            <IconRefresh className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setEditingRule(null);
              setShowCreateDialog(true);
            }}
          >
            <IconPlus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Suggestions Tab */}
      {activeTab === "suggestions" && (
        <Card>
          <CardHeader>
            <CardTitle>Reorder Suggestions</CardTitle>
            <CardDescription>
              Products that need to be reordered based on stock levels and rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {initialSuggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconBox className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No reorder suggestions at this time</p>
                <p className="text-sm">All stock levels are healthy</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Suggested Qty</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialSuggestions.map((suggestion) => (
                    <TableRow key={suggestion.productId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {suggestion.productName}
                          </div>
                          {suggestion.sku && (
                            <div className="text-xs text-muted-foreground">
                              SKU: {suggestion.sku}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            suggestion.currentStock === 0
                              ? "text-red-600 font-bold"
                              : ""
                          }
                        >
                          {suggestion.currentStock}
                        </span>
                      </TableCell>
                      <TableCell>{suggestion.reorderPoint}</TableCell>
                      <TableCell className="font-medium">
                        +{suggestion.suggestedQuantity}
                      </TableCell>
                      <TableCell>
                        {suggestion.supplierName || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getUrgencyBadge(suggestion.urgency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            // Navigate to create PO with pre-filled data
                            router.push(
                              `/purchase-orders/create?productId=${
                                suggestion.productId
                              }&quantity=${suggestion.suggestedQuantity}${
                                suggestion.supplierId
                                  ? `&supplierId=${suggestion.supplierId}`
                                  : ""
                              }`
                            );
                          }}
                        >
                          Create PO
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <Card>
          <CardHeader>
            <CardTitle>Reorder Rules</CardTitle>
            <CardDescription>
              Configure automatic reorder points for your products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {initialRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconSettings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No reorder rules configured</p>
                <p className="text-sm">
                  Create rules to get automatic restock suggestions
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    resetForm();
                    setEditingRule(null);
                    setShowCreateDialog(true);
                  }}
                >
                  <IconPlus className="h-4 w-4 mr-1" />
                  Create First Rule
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Order Quantity</TableHead>
                    <TableHead>Preferred Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.productName}</div>
                          {rule.productSku && (
                            <div className="text-xs text-muted-foreground">
                              SKU: {rule.productSku}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{rule.reorderPoint}</TableCell>
                      <TableCell>{rule.reorderQuantity}</TableCell>
                      <TableCell>
                        {rule.supplierName || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => handleToggle(rule.id)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(rule)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(rule.id)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingRule}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingRule(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? "Edit Reorder Rule" : "Create Reorder Rule"}
            </DialogTitle>
            <DialogDescription>
              Set up automatic reorder alerts for a product
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select
                value={formProductId}
                onValueChange={setFormProductId}
                disabled={!!editingRule}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {(editingRule
                    ? products.filter((p) => p.id === editingRule.productId)
                    : availableProducts
                  ).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                      {product.sku && ` (${product.sku})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reorder Point *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formReorderPoint}
                  onChange={(e) => setFormReorderPoint(e.target.value)}
                  placeholder="e.g., 10"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when stock falls to this level
                </p>
              </div>
              <div className="space-y-2">
                <Label>Order Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formReorderQuantity}
                  onChange={(e) => setFormReorderQuantity(e.target.value)}
                  placeholder="e.g., 50"
                />
                <p className="text-xs text-muted-foreground">
                  Suggested quantity to order
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred Supplier</Label>
              <Select value={formSupplierId} onValueChange={setFormSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preference</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
              <Label htmlFor="isActive">Rule is active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingRule(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !formProductId ||
                !formReorderPoint ||
                !formReorderQuantity
              }
            >
              {isSubmitting
                ? "Saving..."
                : editingRule
                ? "Update Rule"
                : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
