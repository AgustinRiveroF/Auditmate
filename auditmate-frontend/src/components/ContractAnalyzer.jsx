import React, { useState } from "react";
import "./ContractAnalyzer.css";

export default function ContractAnalyzer() {
  const [contractCode, setContractCode] = useState("");
  const [analysisResult, setAnalysisResult] = useState([]);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [fileName, setFileName] = useState("");

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const analyzeContract = () => {
    const vulnerabilities = [];

    if (contractCode.includes("+") && contractCode.includes("balances")) {
      vulnerabilities.push({
        type: "Integer Overflow",
        description:
          "Possible integer overflow vulnerability due to unchecked addition of values.",
        fix: "Use SafeMath library or update to Solidity version 0.8.0 or higher to prevent integer overflows.",
      });
    }

    if (contractCode.includes(".call") && contractCode.includes("require") && contractCode.includes("balances")) {
      vulnerabilities.push({
        type: "Reentrancy",
        description:
          "Reentrancy vulnerability where external call is made before updating the state.",
        fix: "Use the checks-effects-interactions pattern to prevent reentrancy attacks.",
      });
    }

    if (contractCode.includes(".call{value:") && !contractCode.includes("gas")) {
      vulnerabilities.push({
        type: "Gas Griefing",
        description:
          "Gas griefing vulnerability due to lack of gas limit, allowing potential gas stipend exploitation.",
        fix: "Always specify a gas limit when making external calls and be cautious with transferring funds to unknown contracts.",
      });
    }

    setAnalysisResult(vulnerabilities);
    setHistory([
      ...history,
      {
        timestamp: new Date().toLocaleString(),
        code: contractCode,
        vulnerabilities,
        fileName,
      },
    ]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setContractCode(e.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className={`contract-analyzer ${theme}`}>
      <h1>AuditMate 🧠</h1>
      <button onClick={handleThemeToggle}>
        {theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}
      </button>

      <label htmlFor="contractInput">🧠 AuditMate Solidity Analyzer</label>
      <textarea
        id="contractInput"
        rows="12"
        placeholder="Pega tu contrato Solidity acá..."
        value={contractCode}
        onChange={(e) => setContractCode(e.target.value)}
      />

      <input type="file" accept=".sol" onChange={handleFileUpload} />
      <br />
      <button onClick={analyzeContract}>🔍 Analizar</button>

      {analysisResult.length > 0 && (
        <>
          <h2>🚨 Vulnerabilidades detectadas:</h2>
          {analysisResult.map((vuln, i) => (
            <div key={i} className="vulnerability-card">
              <h3>🚨 {vuln.type}</h3>
              <p><strong>¿Qué es?</strong><br />{vuln.description}</p>
              <p><strong>¿Cómo lo arreglás?</strong><br />{vuln.fix}</p>
            </div>
          ))}
        </>
      )}

      <div className="analysis-history">
        <h2>📜 Historial de contratos</h2>
        {history.map((entry, i) => (
          <div key={i} className="vulnerability-card">
            <p><strong>🕒 {entry.timestamp}</strong> — {entry.fileName || "sin nombre"}</p>
            {entry.vulnerabilities.length > 0 ? (
              entry.vulnerabilities.map((v, j) => (
                <div key={j}>
                  <p>⚠️ <strong>{v.type}</strong></p>
                </div>
              ))
            ) : (
              <p>✅ Sin vulnerabilidades detectadas</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
