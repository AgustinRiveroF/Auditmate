import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ContractRequest(BaseModel):
    code: str

@app.post("/analyze")
async def analyze_contract(req: ContractRequest):
    prompt = f"""
Sos un experto en seguridad de contratos inteligentes.

Analizá este código Solidity y devolveme las vulnerabilidades detectadas en formato JSON. No expliques nada fuera del JSON. El formato debe ser:

{{
  "vulnerabilities": [
    {{
      "name": "Nombre de la vulnerabilidad",
      "description": "Descripción breve del problema",
      "suggestions": "Cómo se puede mitigar o resolver"
    }},
    ...
  ]
}}

Código a analizar:
{req.code}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Sos un analizador de seguridad Solidity. Respondé solo en JSON, sin explicaciones afuera."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1200,
        )

        raw = response.choices[0].message.content.strip()

        # Intentar encontrar el JSON limpio aunque venga entre ```json ... ```
        start = raw.find("{")
        end = raw.rfind("}") + 1
        json_str = raw[start:end]

        data = json.loads(json_str)
        vulnerabilities = data.get("vulnerabilities", [])

        if not vulnerabilities:
            return {"analysis": "✅ No se detectaron vulnerabilidades relevantes."}

        resultado = []

        for vul in vulnerabilities:
            name = vul.get("name", "Vulnerabilidad desconocida")
            desc = vul.get("description", "Sin descripción.")
            fix = vul.get("suggestions", "").strip()

            if not fix:
                lname = name.lower()
                if "reentrancy" in lname:
                    fix = "Usá el patrón Checks-Effects-Interactions y actualizá balances antes de enviar fondos."
                elif "overflow" in lname:
                    fix = "Usá SafeMath o tipos seguros. A partir de Solidity 0.8.0 los overflows tiran error."
                elif "gas" in lname:
                    fix = "Limitá el uso de gas en llamadas externas o usá .transfer en lugar de .call."

            resultado.append({
                "nombre": name,
                "descripcion": desc,
                "sugerencias": fix
            })

        return {"vulnerabilidades": resultado}


    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al analizar: {str(e)}")
