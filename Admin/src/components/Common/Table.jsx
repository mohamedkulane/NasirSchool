// src/components/Common/Table.jsx
import React from 'react';

const Table = ({ columns, data, loading, emptyMessage = "No data found" }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#102C57]"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center transform transition-all duration-500 hover:shadow-3xl">
        <div className="text-6xl mb-4 opacity-50">📊</div>
        <h3 className="text-xl font-semibold text-[#102C57] mb-3">No Data Available</h3>
        <p className="text-[#1E4A82]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#102C57] to-[#1E4A82]">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider transition-all duration-300 hover:bg-white/10"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-white/50 transition-all duration-300 transform hover:scale-[1.01] group"
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-[#102C57] group-hover:text-[#1E4A82] transition-colors duration-300"
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;