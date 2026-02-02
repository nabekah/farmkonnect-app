import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
} from '@/components/ui/sidebar';
import type { MenuGroup as MenuGroupType, MenuItem } from './NavigationStructure';

interface MenuGroupProps {
  group: MenuGroupType;
  isCollapsed: boolean;
  onNavigate: (path: string) => void;
  currentPath: string;
  filteredItems: MenuItem[];
}

export function MenuGroup({
  group,
  isCollapsed,
  onNavigate,
  currentPath,
  filteredItems,
}: MenuGroupProps) {
  const [isExpanded, setIsExpanded] = useState(group.defaultExpanded ?? true);

  if (filteredItems.length === 0) {
    return null;
  }

  if (!group.collapsible) {
    return (
      <SidebarMenu>
        {filteredItems.map((item) => (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton
              asChild
              isActive={currentPath === item.path}
              onClick={() => onNavigate(item.path)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        {!isCollapsed && (
          <>
            <span className="flex items-center gap-2">
              {group.icon && <group.icon className="h-3 w-3" />}
              {group.title}
            </span>
            {group.collapsible && (
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  isExpanded ? 'rotate-0' : '-rotate-90'
                }`}
              />
            )}
          </>
        )}
      </button>

      {isExpanded && (
        <SidebarMenu className="px-1">
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={currentPath === item.path}
                onClick={() => onNavigate(item.path)}
                className="cursor-pointer ml-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span className="text-sm">{item.label}</span>}
                  </div>
                  {item.badge && !isCollapsed && (
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}

      <div className="my-2 border-b border-sidebar-border" />
    </div>
  );
}
