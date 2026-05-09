"use client";
import { useState, useCallback } from "react";
import { Play, History, Clock, Download } from "lucide-react";

import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";

import Navbar from "@/components/navbar";

const default_schemas = {
  'schema-blank': '-- enter code here',

  'schema-users': `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER
);

INSERT INTO users VALUES
  (1, 'Alice Johnson', 'alice@example.com', 28),
  (2, 'Bob Smith',    'bob@example.com',   34),
  (3, 'Carol White',  'carol@example.com', 25);
  `,
};

function formatTimeAgo(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();

  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60)
    return `${diffSec} seconds ago`;

  if (diffMin < 60)
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;

  if (diffHour < 24)
    return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;

  return date.toLocaleString();
}

export default function Home() {
  const [runRequest, setRunRequest] = useState(false);
  const [schema, setSchema] = useState("CREATE TABLE table_name (x INT);\n\nINSERT INTO table_name VALUES (1), (2);");
  const [query, setQuery] = useState("SELECT * FROM table_name");

  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);

  const onSchemaSelect = (e) => {
    const schema_name = e.target.value;
    setSchema(default_schemas[schema_name].trim() ?? '')
  };

  const onSchemaHistory = (e) => {
    const schema_idx = e.target.value;
    setSchema(history[schema_idx].schema);
  }

  const onQueryHistory = (e) => {
    const query_idx = e.target.value;
    setQuery(history[query_idx].query);
  }

  const onSchemaChange = useCallback((val, viewUpdate) => {
    setSchema(val);
  }, []);

  const onQueryChange = useCallback((val, viewUpdate) => {
    setQuery(val);
  }, []);

  const runQuery = async () => {
    try {
      setRunRequest(true);

      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: 'sqlite', schema: schema, query: query })
      });

      const data = await res.json();
      {
        const last = history[0] ?? { schema: '', query: '' };
        const entry = {
          schema: schema === last.schema ? null : schema,
          query: query === last.query ? null : query,
          timestamp: new Date()
        };

        const entries = [...history, entry];
        setHistory(entries.toSorted((a, b) => b.timestamp - a.timestamp));
      }

      if (data.error !== undefined)
        console.error(data.error);
      setResult(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setRunRequest(false);
    }
  }

  const downloadResult = () => {
    const header = result.columns.join(",");
    const body = result.rows.map(row =>
      result.columns.map(col =>
        `"${String(row[col]).replace(/"/g, '""')}"`
      ).join(",")
    );

    const content = [header, ...body].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const date = new Date().toISOString();
    link.download = `sequel-prep-${date}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Navbar />
      <div className="flex w-full border-b border-[#30363D]">
        <div className="w-[50%] border-r border-[#30363D]" >
          <div className="flex justify-between h-10 items-center px-4 border-b border-[#30363D] bg-[#181c22]">
            <div className="flex items-center gap-4">
              <p className="uppercase text-outline font-inter text-[11px] text-[#948ea1]">Database Schema</p>
              <select className="bg-[#161B22] text-white outline-none border border-[#30363D] text-xs px-2 py-1 rounded appearance-none" id="schema" name="schema" onChange={onSchemaSelect}>
                <option value="schema-blank">Blank</option>
                <option value="schema-users">Users</option>
              </select>
            </div>

            <div>
              {/* <p className="flex items-center gap-1 text-[#948ea1] text-[12px]">
                <History size={12} />
                Browse History
              </p> */}
              {/* <select id="history" name="history" onChange={onSchemaHistory}>
                {
                  history !== [] && history.map((h, idx) =>
                    h.schema !== null &&
                      <option key={idx} value={idx}>
                          Schema #{idx+1} - {formatTimeAgo(h.timestamp)}
                      </option>
                  )
                }
              </select> */}
            </div>
          </div>

          <CodeMirror value={schema} theme={tokyoNight}  height="55vh" extensions={[sql()]} onChange={onSchemaChange} />
        </div>
        <div className="w-[50%] relative">
          <div className="flex justify-between h-10 items-center px-4 border-b border-[#30363D] bg-[#181c22]">
            <p className="uppercase text-outline font-inter text-[11px] text-[#948ea1]">Sql query</p>
            {/* <p className="flex items-center gap-1  text-[#948ea1] text-[12px]">
              <History size={12} />
              Browse History
            </p> */}

            {/* <select id="history" name="history" onChange={onQueryHistory}>
              {
                history !== [] && history.map((h, idx) =>
                  h.query !== null &&
                    <option key={idx} value={idx}>
                      Query #{idx+1} - {formatTimeAgo(h.timestamp)}
                    </option>
                )
              }
            </select> */}
          </div>
          <CodeMirror value={query} theme={tokyoNight}  height="55vh" extensions={[sql()]} onChange={onQueryChange} />
          {!runRequest && <button onClick={runQuery} className="flex items-center gap-2 absolute bottom-6 right-6 uppercase px-6 py-3 bg-[#7C4DFF] text-white rounded shadow-2xl hover:scale-[1.02] active:scale-95 transition-all font-bold">
            <Play size={16} fill="white" />
            Run Query
          </button>}
        </div>
      </div>
      <div className="w-full h-[35vh] overflow-auto bg-primary">
        <div className="h-10 flex items-center justify-between px-4 border-b border-[#30363D] bg-[#181c22]">
          <div className="flex gap-4">
            <p className="uppercase text-outline font-inter text-[11px] text-[#948ea1]">Results</p>
            {result && result.error === undefined && <>
              <p className="font-inter text-[11px] text-[#948ea1]">{result.rows.length} rows returned</p>
              <p className="font-inter text-[11px] text-[#948ea1]">Executed in {result.time / 1000} seconds</p>
            </>}
          </div>
          {result && result.error === undefined && <button onClick={downloadResult} className="hover:scale-105 hover:bg-white/10 p-1 rounded-lg">
            <Download size={18} className="text-[#948ea1]" />
          </button>}
        </div>
        {
          runRequest &&
            <div className="w-full pt-16 flex items-center justify-center flex-col gap-4">
              <Clock className="text-[#948ea1]" size={72} />
              <p className="text-3xl text-[#948ea1]">Execution in progress...</p>
            </div>
        }
        {!runRequest && result && result.error !== undefined &&
          <p className="text-red-400 p-2">{result.error}</p>
        }
        {!runRequest && result && result.error === undefined &&
          <table className="w-full text-left font-inter text-[13px]">
            <thead>
              <tr>
                {result.columns.map(col => (
                  <th key={col} className="bg-[#262a31] text-left text-sm sticky top-0 p-3 border-b border-[#30363D] border-r border-[#21262D] text-[#cac3d8] text-[11px]">
                    {col.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D]">
              {result.rows.map((row, i) => (
                <tr key={i} className="bg-[#10141a] hover:bg-[#161B22] transition-colors">
                  {result.columns.map(col => (
                    <td key={col}
                      className={`p-3 border-r border-[#21262D]
                          ${
                            typeof row[col] === "number" ? "text-indigo-400"
                            : "text-gray-600"
                          }

                          ${
                            row[col] === null ? "italic" : "not-italic"
                          }
                        `}
                      >
                      {row[col] === null ? "NULL" : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}
