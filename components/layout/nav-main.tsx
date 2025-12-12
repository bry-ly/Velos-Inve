"use client";

import {
  type Icon,
  IconChevronRight,
  IconCirclePlusFilled,
  IconPackage,
  IconBuildingFactory,
  IconCurrencyPeso,
  IconHash,
  IconTag,
} from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { createProduct } from "@/lib/action/product";

export function NavMain({
  items,
  label,
  onLinkClick,
  showQuickCreate,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  label?: string;
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, url: string) => void;
  showQuickCreate?: boolean;
}) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateValue, setQuickCreateValue] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [condition, setCondition] = useState("new");
  const [isSubmitting, startTransition] = useTransition();

  // Default showQuickCreate to true if not provided
  const shouldShowQuickCreate = showQuickCreate ?? true;

  // Automatically open the group that contains the active page
  // This effect runs when the pathname changes (navigation)
  useState(() => {
    const activeItem = items.find((item) =>
      item.items?.some((subItem) => subItem.url === pathname)
    );
    if (activeItem) {
      setOpenItem(activeItem.title);
    }
  });

  const handleOpenChange = (open: boolean) => {
    setQuickCreateOpen(open);
    if (!open) {
      // Reset form on close
      setTimeout(() => {
        setQuickCreateValue("");
        setManufacturer("");
        setPrice("");
        setQuantity("0");
        setCondition("new");
      }, 300);
    }
  };

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Quick Create Button */}
          {shouldShowQuickCreate && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Quick Create Product"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground w-full duration-200 ease-linear shadow-sm"
                onClick={() => setQuickCreateOpen(true)}
              >
                <IconCirclePlusFilled className="size-5" />
                <span className="truncate font-medium">Quick Create</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {items.map((item) => {
            // Check if this is the currently active page or one of its children
            const isChildActive = item.items?.some(
              (subItem) => subItem.url === pathname
            );
            const isMainActive = pathname === item.url;
            const isActive = isMainActive || isChildActive;

            // If text is hidden (collapsed) and we have items, we want to treat it as a link (if url exists)
            // standard behavior for collapsed sidebar with submenus is to show a popover
            // BUT the user specifically requested: "when i click the icon it go to the pages"
            // So we override the collapsible behavior when collapsed.
            const { state, isMobile } = useSidebar();
            const isCollapsed = state === "collapsed" && !isMobile;

            if (!item.items || item.items.length === 0 || isCollapsed) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <Link
                      href={item.url}
                      prefetch={true}
                      onClick={(e) => onLinkClick?.(e, item.url)}
                    >
                      {item.icon && <item.icon />}
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
            return (
              <Collapsible
                key={item.title}
                asChild
                open={openItem === item.title}
                onOpenChange={(isOpen) => {
                  setOpenItem(isOpen ? item.title : null);
                }}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      {item.icon && <item.icon />}
                      <span className="truncate">{item.title}</span>
                      <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.url}
                            className={
                              pathname === subItem.url
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : ""
                            }
                          >
                            <Link
                              href={subItem.url}
                              prefetch={true}
                              onClick={(e) => onLinkClick?.(e, subItem.url)}
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>

        {/* Quick Create Dialog */}
        <Dialog open={quickCreateOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconCirclePlusFilled className="size-5" />
                </div>
                Quick Create Product
              </DialogTitle>
              <DialogDescription>
                Add a new product to your inventory. Fill in the essential
                details below.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!quickCreateValue.trim()) {
                  toast.error("Product name is required");
                  return;
                }
                if (!manufacturer.trim()) {
                  toast.error("Manufacturer is required");
                  return;
                }

                startTransition(async () => {
                  const formData = new FormData();
                  formData.append("name", quickCreateValue.trim());
                  formData.append("manufacturer", manufacturer.trim());
                  formData.append("price", price || "0");
                  formData.append("quantity", quantity || "0");
                  formData.append("condition", condition);

                  try {
                    const result = await createProduct(formData);
                    if (result?.success) {
                      toast.success(
                        result.message ?? "Product created successfully!"
                      );
                      handleOpenChange(false);
                      router.refresh();
                    } else if (result?.errors) {
                      const errorMessages = Object.values(result.errors)
                        .flat()
                        .join(", ");
                      toast.error(result.message ?? "Validation failed", {
                        description: errorMessages,
                      });
                    } else {
                      toast.error(
                        result?.message ?? "Failed to create product."
                      );
                    }
                  } catch (error) {
                    toast.error("Failed to create product.", {
                      description:
                        error instanceof Error
                          ? error.message
                          : "An unexpected error occurred.",
                    });
                  }
                });
              }}
              className="space-y-5 py-2"
            >
              <div className="space-y-2">
                <Label htmlFor="quick-name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <IconPackage className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="quick-name"
                    value={quickCreateValue}
                    onChange={(e) => setQuickCreateValue(e.target.value)}
                    placeholder="e.g. Office Chair, Wireless Mouse"
                    className="pl-9"
                    autoFocus
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-manufacturer">
                  Manufacturer <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <IconBuildingFactory className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="quick-manufacturer"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Acme Corp, Generic Brand"
                    className="pl-9"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quick-price">Price</Label>
                  <div className="relative">
                    <IconCurrencyPeso className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="quick-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-quantity">Quantity</Label>
                  <div className="relative">
                    <IconHash className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="quick-quantity"
                      type="number"
                      step="1"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-condition">Condition</Label>
                <Select
                  value={condition}
                  onValueChange={setCondition}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="quick-condition" className="pl-9 relative">
                    <IconTag className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                    <SelectItem value="broken">For Parts / Broken</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
