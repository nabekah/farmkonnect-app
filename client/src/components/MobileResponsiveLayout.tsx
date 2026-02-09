import { ReactNode } from 'react';
import { useMobileOptimization, useResponsiveColumns, useResponsiveFontSize } from '@/hooks/useMobileOptimization';

interface MobileResponsiveLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function MobileResponsiveLayout({
  children,
  title,
  subtitle,
  className = ''
}: MobileResponsiveLayoutProps) {
  const { isMobile } = useMobileOptimization();
  const fontSize = useResponsiveFontSize();

  return (
    <div className={`w-full ${isMobile ? 'px-3 py-2' : 'px-6 py-4'} ${className}`}>
      {title && (
        <div className={`mb-${isMobile ? '3' : '6'}`}>
          <h1 className={`font-bold ${fontSize.heading} ${isMobile ? 'mb-1' : 'mb-2'}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-gray-600 ${fontSize.subheading}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  maxColumns?: number;
  gap?: string;
}

export function ResponsiveGrid({
  children,
  maxColumns = 4,
  gap = 'gap-4'
}: ResponsiveGridProps) {
  const columns = useResponsiveColumns(maxColumns);
  const gridClass = `grid grid-cols-${columns} ${gap}`;

  return <div className={gridClass}>{children}</div>;
}

interface ResponsiveCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ResponsiveCard({
  children,
  onClick,
  className = ''
}: ResponsiveCardProps) {
  const { isMobile } = useMobileOptimization();

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200
        ${isMobile ? 'p-3' : 'p-4'}
        hover:shadow-md transition-shadow cursor-pointer
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface ResponsiveTableProps {
  headers: string[];
  rows: (string | number)[][];
  className?: string;
}

export function ResponsiveTable({
  headers,
  rows,
  className = ''
}: ResponsiveTableProps) {
  const { isMobile } = useMobileOptimization();
  const fontSize = useResponsiveFontSize();

  if (isMobile) {
    return (
      <div className={`space-y-3 ${className}`}>
        {rows.map((row, idx) => (
          <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
            {headers.map((header, headerIdx) => (
              <div key={headerIdx} className="flex justify-between mb-2 last:mb-0">
                <span className={`font-semibold text-gray-600 ${fontSize.small}`}>
                  {header}
                </span>
                <span className={`text-gray-900 ${fontSize.body}`}>
                  {row[headerIdx]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className={`text-left p-3 font-semibold text-gray-700 ${fontSize.small}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className={`p-3 text-gray-900 ${fontSize.body}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ResponsiveButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveButtonGroup({
  children,
  className = ''
}: ResponsiveButtonGroupProps) {
  const { isMobile } = useMobileOptimization();

  return (
    <div
      className={`
        flex ${isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
