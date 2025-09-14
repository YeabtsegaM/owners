// Utility functions for exporting data to CSV format

export interface ExportableData {
  [key: string]: string | number | Date | null | undefined;
}

export interface ExportOptions {
  includeDateRange?: boolean;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  reportType?: string;
}

export const exportToCSV = (data: ExportableData[], filename: string, options?: ExportOptions): void => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the actual data
  const dataHeaders = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = '';
  
  // Add metadata section if requested
  if (options?.includeDateRange && options.dateRange) {
    csvContent += `Report Information\n`;
    csvContent += `Report Type,${options.reportType || 'Report'}\n`;
    csvContent += `Date Range,${options.dateRange.from?.toLocaleDateString() || 'N/A'} to ${options.dateRange.to?.toLocaleDateString() || 'N/A'}\n`;
    csvContent += `Export Date,${new Date().toLocaleDateString()}\n`;
    csvContent += `Export Time,${new Date().toLocaleTimeString()}\n`;
    csvContent += `\n`; // Empty line for spacing
  }
  
  // Add data section
  csvContent += `Data\n`;
  csvContent += dataHeaders.map(header => `"${header}"`).join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const rowData = dataHeaders.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '""';
      }
      // Handle different data types
      if (value instanceof Date) {
        return `"${value.toLocaleDateString()}"`;
      }
      if (typeof value === 'number') {
        return `"${value.toLocaleString()}"`;
      }
      // Escape quotes in strings
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvContent += rowData.join(',') + '\n';
  });

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Format data for export with proper column names
export const formatShopDataForExport = (data: Record<string, unknown>[]): ExportableData[] => {
  return data.map(item => ({
    'Shop Name': item.shopName as string || 'Unknown Shop',
    'Total Tickets': item.tickets as number || 0,
    'Total Bets (Br.)': item.bets as number || 0,
    'Unclaimed Amount (Br.)': item.unclaimed as number || 0,
    'Redeemed Amount (Br.)': item.redeemed as number || 0,
    'Net Balance (Br.)': item.netBalance as number || 0,
    'Last Updated': item.lastUpdated ? new Date(item.lastUpdated as string).toLocaleDateString() : 'N/A'
  }));
};

export const formatCashierDataForExport = (data: Record<string, unknown>[]): ExportableData[] => {
  return data.map(item => ({
    'Shop Name': item.shopName as string || 'Unknown Shop',
    'Cashier Name': item.cashierName as string || 'Unknown Cashier',
    'Total Tickets': item.tickets as number || 0,
    'Total Bets (Br.)': item.bets as number || 0,
    'Unclaimed Amount (Br.)': item.unclaimed as number || 0,
    'Redeemed Amount (Br.)': item.redeemed as number || 0,
    'Net Balance (Br.)': item.netBalance as number || 0,
    'Last Updated': item.lastUpdated ? new Date(item.lastUpdated as string).toLocaleDateString() : 'N/A'
  }));
};

// Generate filename with current date
export const generateExportFilename = (reportType: string): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
  
  return `${reportType}_Report_${dateStr}_${timeStr}`;
};

// Test function to verify export functionality
export const testExport = (): void => {
  const testData: ExportableData[] = [
    {
      'Shop Name': 'Test Shop 1',
      'Total Tickets': 100,
      'Total Bets (Br.)': 1000,
      'Unclaimed Amount (Br.)': 50,
      'Redeemed Amount (Br.)': 900,
      'Net Balance (Br.)': 50,
      'Last Updated': '2025-01-01'
    },
    {
      'Shop Name': 'Test Shop 2',
      'Total Tickets': 200,
      'Total Bets (Br.)': 2000,
      'Unclaimed Amount (Br.)': 100,
      'Redeemed Amount (Br.)': 1800,
      'Net Balance (Br.)': 100,
      'Last Updated': '2025-01-01'
    }
  ];
  
  exportToCSV(testData, 'test_export');
};
