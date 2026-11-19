import { useState } from "react";
import { Link } from "react-router-dom";

const COHORT_LABEL = "DATOS SIMULADOS / COHORTE DE PRUEBA (n=60)";

const INPUT_CASES = {
  settlement: {
    label: "Registro de liquidación",
    input: "Ruta demo: $8,000 esperados; $7,600 contados.",
    result: "Diferencia de $400 para revisión humana; no indica causa ni responsabilidad.",
  },
  friday: {
    label: "Nota de voz (guion ficticio)",
    input: "“Quedaron dos cajas pendientes de liquidar en la ruta demo.”",
    result: "Convertir la nota en una lista de seguimiento, sin inferir impago ni identificar personas.",
  },
  close: {
    label: "Cierre del Día",
    input: "Registro demo: ventas $2,450; efectivo contado $2,400.",
    result: "Mostrar una diferencia de $50 para revisar junto con la comerciante, sin atribuir motivos.",
  },
};

const formatMoney = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);

function SimulationNotice() {
  return <p className="distribution-simulation-notice">{COHORT_LABEL}</p>;
}

export default function DistributionPage() {
  const [selectedCase, setSelectedCase] = useState("settlement");
  const [processedCase, setProcessedCase] = useState("settlement");
  const [weeklyCredit, setWeeklyCredit] = useState("8000");
  const [unpaidPercent, setUnpaidPercent] = useState("5");

  const currentCase = INPUT_CASES[processedCase];
  const amount = Math.min(100000, Math.max(0, Number(weeklyCredit) || 0));
  const percent = Math.min(100, Math.max(0, Number(unpaidPercent) || 0));
  const illustrativeGap = (amount * percent) / 100;

  return (
    <main className="content-shell distribution-page">
      <section className="page-heading">
        <p className="eyebrow">Validador del Comercio · Distribución</p>
        <h1>Tu método alimenta a tu audiencia</h1>
        <p className="intro">
          Explora cómo una señal operativa ficticia puede convertirse en una
          explicación útil para un equipo de ruta, sin exponer datos personales.
        </p>
      </section>

      <section className="distribution-pipeline" aria-labelledby="pipeline-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Simulador local · sin enviar datos</p>
            <h2 id="pipeline-heading">Input → Método → Contenido Útil</h2>
          </div>
          <SimulationNotice />
        </div>
        <div className="pipeline-grid">
          <article className="pipeline-card">
            <p className="pipeline-step">1 · Input</p>
            <label htmlFor="distribution-input">Elige un caso de demostración</label>
            <select
              id="distribution-input"
              value={selectedCase}
              onChange={(event) => setSelectedCase(event.target.value)}
            >
              {Object.entries(INPUT_CASES).map(([key, item]) => (
                <option key={key} value={key}>{item.label}</option>
              ))}
            </select>
            <SimulationNotice />
            <p>{INPUT_CASES[selectedCase].input}</p>
            <button
              className="primary-action"
              type="button"
              onClick={() => setProcessedCase(selectedCase)}
            >
              Aplicar método
            </button>
          </article>

          <article className="pipeline-card">
            <p className="pipeline-step">2 · Método</p>
            <h3>Motor Validador · demostración</h3>
            <p>
              Ordena la entrada y señala qué revisar. Esta página no ejecuta
              modelos de IA, consulta sistemas externos ni decide sobre crédito.
            </p>
            <SimulationNotice />
          </article>

          <article className="pipeline-card pipeline-card--result" aria-live="polite">
            <p className="pipeline-step">3 · Contenido útil</p>
            <h3>Tarjeta para equipo B2B</h3>
            <SimulationNotice />
            <p>{currentCase.result}</p>
            <p className="disclaimer">
              Requiere criterio humano; no es una predicción ni una decisión
              sobre una persona.
            </p>
          </article>
        </div>
      </section>

      <section className="campaign-section" aria-labelledby="campaign-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Tres formatos terminados · piezas de demostración</p>
            <h2 id="campaign-heading">Método convertido en contenido</h2>
          </div>
        </div>
        <div className="campaign-grid">
          <article className="campaign-card">
            <p className="eyebrow">Formato 1 · Tarjeta de telemetría de ruta</p>
            <h3>Una diferencia visible, sin buscar culpables</h3>
            <SimulationNotice />
            <dl className="route-telemetry">
              <div><dt>Liquidación esperada</dt><dd>$8,000 MXN</dd></div>
              <div><dt>Registro contado</dt><dd>$7,600 MXN</dd></div>
              <div><dt>Diferencia por revisar</dt><dd>$400 MXN</dd></div>
            </dl>
            <p className="disclaimer">Ruta ficticia. Ningún dato corresponde a una persona o empresa real.</p>
            <Link className="secondary-action distribution-cta" to="/waitlist">Solicitar acceso B2B</Link>
          </article>

          <article className="campaign-card">
            <p className="eyebrow">Formato 2 · Auditoría de liquidación antes/después</p>
            <h3>Del registro disperso a una revisión clara</h3>
            <SimulationNotice />
            <div className="audit-comparison">
              <div>
                <h4>Antes</h4>
                <p>Esperado: $8,000 · contado: $7,600</p>
                <p>La diferencia queda sin contexto.</p>
              </div>
              <div>
                <h4>Después</h4>
                <p>Diferencia: $400 para revisar.</p>
                <p>El equipo confirma el registro con la ruta.</p>
              </div>
            </div>
            <p className="disclaimer">Ejemplo didáctico; no representa una mejora medida.</p>
            <Link className="secondary-action distribution-cta" to="/waitlist">Solicitar acceso B2B</Link>
          </article>

          <article className="campaign-card">
            <p className="eyebrow">Formato 3 · Calculadora interactiva de fugas por fiado</p>
            <h3>Explora un escenario, no una predicción</h3>
            <SimulationNotice />
            <div className="leak-calculator">
              <label htmlFor="weekly-credit">Fiado semanal de ejemplo (MXN)</label>
              <input
                id="weekly-credit"
                type="number"
                min="0"
                max="100000"
                step="100"
                inputMode="decimal"
                value={weeklyCredit}
                onChange={(event) => setWeeklyCredit(event.target.value)}
              />
              <label htmlFor="unpaid-percent">Porcentaje pendiente hipotético</label>
              <input
                id="unpaid-percent"
                type="number"
                min="0"
                max="100"
                step="1"
                inputMode="decimal"
                value={unpaidPercent}
                onChange={(event) => setUnpaidPercent(event.target.value)}
              />
              <p className="leak-result">
                Diferencia ilustrativa: <strong>{formatMoney(illustrativeGap)}</strong>
              </p>
              <p className="disclaimer">
                El resultado usa solo estos controles, limitados a $100,000 y
                100%; no estima pérdidas reales ni recuperación.
              </p>
            </div>
            <Link className="secondary-action distribution-cta" to="/waitlist">Solicitar acceso B2B</Link>
          </article>
        </div>
      </section>

      <aside className="distribution-next-step">
        <div>
          <p className="eyebrow">Siguiente paso para equipos de distribución</p>
          <h2>Prueba el flujo con tu propio equipo</h2>
          <p>La solicitud es opt-in y requiere iniciar sesión con Google.</p>
        </div>
        <Link className="primary-action distribution-cta" to="/waitlist">Ir a la lista de acceso</Link>
      </aside>
    </main>
  );
}
