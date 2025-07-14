import React from 'react';

interface DataTableProps<T> {
  columns: { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode }[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
}

function DataTable<T extends { id: string | number }>({ columns, data, actions }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm text-gray-700 bg-white">
        <thead>
          <tr className="bg-gray-50">
            {columns.map(col => (
              <th key={col.key as string} className="px-4 py-2 text-left">{col.label}</th>
            ))}
            {actions && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} className="border-b hover:bg-blue-50/30">
              {columns.map(col => (
                <td key={col.key as string} className="px-4 py-2">
                  {col.render ? col.render(row) : (row[col.key as keyof T] as any)}
                </td>
              ))}
              {actions && <td className="px-4 py-2">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable; 