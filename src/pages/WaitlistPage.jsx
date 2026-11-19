import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PUBLIC_SOCIAL_CHANNEL_URL } from "../config/publicChannel.js";
import {
  supabase,
  supabaseConfigurationError,
} from "../lib/supabase.js";

const COMPANY_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s&.'()/-]{1,79}$/u;
const RFC_PATTERN = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/;
const WHATSAPP_PATTERN = /^\d{10}$/;

const INITIAL_FORM = {
  companyName: "",
  rfc: "",
  routeCount: "",
  whatsapp: "",
  consent: false,
};

function sanitizeCompanyName(value) {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeDigits(value, limit) {
  return value.replace(/\D/g, "").slice(0, limit);
}

function validateForm(form) {
  const errors = {};
  const companyName = sanitizeCompanyName(form.companyName);
  const rfc = form.rfc.trim().toUpperCase();
  const routeCount = form.routeCount;
  const whatsapp = form.whatsapp;
  const routes = Number(routeCount);

  if (
    companyName.length < 2 ||
    companyName.length > 80 ||
    !COMPANY_PATTERN.test(companyName)
  ) {
    errors.companyName =
      "Escribe un nombre de empresa de 2 a 80 caracteres (letras, números y puntuación básica).";
  }
  if (!RFC_PATTERN.test(rfc)) {
    errors.rfc = "Escribe un RFC mexicano válido de 12 caracteres (empresa) o 13 (persona física).";
  }
  if (!/^\d{1,3}$/.test(routeCount) || !Number.isInteger(routes) || routes < 1 || routes > 500) {
    errors.routeCount = "Indica un número entero de rutas entre 1 y 500.";
  }
  if (!WHATSAPP_PATTERN.test(whatsapp)) {
    errors.whatsapp = "Escribe los 10 dígitos de WhatsApp, sin espacios ni prefijo.";
  }
  if (!form.consent) {
    errors.consent = "Confirma que autorizas guardar esta solicitud para seguimiento.";
  }

  return {
    errors,
    values: { companyName, rfc, routeCount: routes, whatsapp },
  };
}

export default function WaitlistPage() {
  const [session, setSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(Boolean(supabase));
  const [authError, setAuthError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingLead, setHasExistingLead] = useState(false);
  const [isCheckingLead, setIsCheckingLead] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let isMounted = true;
    const loadSession = async () => {
      setIsLoadingSession(true);
      setAuthError("");
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        if (isMounted) {
          setSession(data.session);
        }
      } catch (error) {
        if (isMounted) {
          setAuthError(
            error instanceof Error
              ? `No se pudo revisar la sesión: ${error.message}`
              : "No se pudo revisar la sesión de Supabase."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    };

    void loadSession();
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setAuthError("");
        setHasExistingLead(false);
        setIsSubmitted(false);
      }
    );

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setHasExistingLead(false);
      return undefined;
    }

    let isMounted = true;
    const checkExistingLead = async () => {
      setIsCheckingLead(true);
      setFormError("");
      try {
        const { data, error } = await supabase
          .from("waitlist_leads")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (error) {
          throw error;
        }
        if (isMounted) {
          setHasExistingLead(Boolean(data));
        }
      } catch (error) {
        if (isMounted) {
          setFormError(
            error instanceof Error
              ? `No se pudo consultar tu solicitud: ${error.message}`
              : "No se pudo consultar tu solicitud. Inténtalo de nuevo."
          );
        }
      } finally {
        if (isMounted) {
          setIsCheckingLead(false);
        }
      }
    };

    void checkExistingLead();
    return () => {
      isMounted = false;
    };
  }, [session]);

  const signInWithGoogle = async () => {
    if (!supabase) {
      return;
    }
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/waitlist`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? `No se pudo iniciar sesión con Google: ${error.message}`
          : "No se pudo iniciar sesión con Google. Inténtalo de nuevo."
      );
    }
  };

  const signOut = async () => {
    if (!supabase) {
      return;
    }
    setAuthError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSession(null);
      setForm(INITIAL_FORM);
      setHasExistingLead(false);
      setIsSubmitted(false);
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? `No se pudo cerrar la sesión: ${error.message}`
          : "No se pudo cerrar la sesión de Supabase."
      );
    }
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setFormError("");
  };

  const submitLead = async (event) => {
    event.preventDefault();
    setFormError("");
    const validation = validateForm(form);
    setFieldErrors(validation.errors);
    if (Object.keys(validation.errors).length > 0) {
      return;
    }
    if (!supabase || !session) {
      setFormError("Inicia sesión con Google antes de enviar la solicitud.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist_leads").insert({
        user_id: session.user.id,
        company_name: validation.values.companyName,
        rfc: validation.values.rfc,
        route_count: validation.values.routeCount,
        whatsapp: validation.values.whatsapp,
        consented_at: new Date().toISOString(),
      });
      if (error) {
        throw error;
      }
      setIsSubmitted(true);
      setHasExistingLead(true);
      setForm(INITIAL_FORM);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? `No se pudo guardar la solicitud: ${error.message}`
          : "No se pudo guardar la solicitud. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="content-shell waitlist-page">
      <section className="page-heading">
        <p className="eyebrow">Validador del Comercio · Acceso B2B</p>
        <h1>Conversemos sobre tus rutas</h1>
        <p className="intro">
          La lista es voluntaria para equipos de distribución. Inicia sesión con
          Google para que tu solicitud quede asociada a tu propia cuenta.
        </p>
      </section>

      <section className="waitlist-card" aria-labelledby="waitlist-heading">
        <h2 id="waitlist-heading">Solicitud de acceso anticipado</h2>
        <p className="waitlist-privacy">
          Si continúas, guardarás los datos que escribas en Supabase para dar
          seguimiento a esta solicitud. La fila es privada por RLS y solo tu
          usuario autenticado puede leerla. No se consulta el RFC con SAT ni se
          envían mensajes de WhatsApp desde este prototipo.
        </p>

        {supabaseConfigurationError && (
          <p className="configuration-notice" role="status">
            {supabaseConfigurationError}
          </p>
        )}

        {authError && <p className="error-message" role="alert">{authError}</p>}

        {!session && (
          <button
            className="primary-action waitlist-google-button"
            type="button"
            onClick={signInWithGoogle}
            disabled={!supabase || isLoadingSession}
          >
            {isLoadingSession ? "Revisando sesión..." : "Continuar con Google"}
          </button>
        )}

        {session && (
          <div className="waitlist-session-row">
            <p>Sesión iniciada con Google. Tu solicitud quedará vinculada a esta cuenta.</p>
            <button className="secondary-action" type="button" onClick={signOut}>
              Cerrar sesión
            </button>
          </div>
        )}

        {session && isCheckingLead && (
          <p className="field-help" role="status">Revisando si ya existe una solicitud en tu cuenta…</p>
        )}

        {session && hasExistingLead && (
          <div className="waitlist-success" role="status">
            <h3>{isSubmitted ? "Solicitud recibida" : "Ya recibimos tu solicitud"}</h3>
            <p>
              La fila asociada a tu cuenta está guardada. No mostramos ni
              devolvemos aquí los datos de contacto.
            </p>
          </div>
        )}

        {session && !hasExistingLead && !isCheckingLead && (
          <form className="waitlist-form" onSubmit={submitLead} noValidate>
            <div className="waitlist-field">
              <label htmlFor="company-name">Nombre de empresa</label>
              <input
                id="company-name"
                name="companyName"
                type="text"
                autoComplete="organization"
                maxLength={80}
                value={form.companyName}
                onChange={(event) => updateForm("companyName", event.target.value)}
                aria-invalid={Boolean(fieldErrors.companyName)}
                aria-describedby={fieldErrors.companyName ? "company-name-error" : "company-name-help"}
                required
              />
              <p id="company-name-help" className="field-help">De 2 a 80 caracteres.</p>
              {fieldErrors.companyName && <p id="company-name-error" className="field-error" role="alert">{fieldErrors.companyName}</p>}
            </div>

            <div className="waitlist-field">
              <label htmlFor="rfc">RFC mexicano</label>
              <input
                id="rfc"
                name="rfc"
                type="text"
                autoCapitalize="characters"
                autoComplete="off"
                maxLength={13}
                value={form.rfc}
                onChange={(event) => updateForm("rfc", event.target.value.toUpperCase())}
                aria-invalid={Boolean(fieldErrors.rfc)}
                aria-describedby={fieldErrors.rfc ? "rfc-error" : "rfc-help"}
                required
              />
              <p id="rfc-help" className="field-help">12 caracteres para empresa o 13 para persona física.</p>
              {fieldErrors.rfc && <p id="rfc-error" className="field-error" role="alert">{fieldErrors.rfc}</p>}
            </div>

            <div className="waitlist-field">
              <label htmlFor="route-count">Número de rutas</label>
              <input
                id="route-count"
                name="routeCount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={3}
                value={form.routeCount}
                onChange={(event) => updateForm("routeCount", sanitizeDigits(event.target.value, 3))}
                aria-invalid={Boolean(fieldErrors.routeCount)}
                aria-describedby={fieldErrors.routeCount ? "route-count-error" : "route-count-help"}
                required
              />
              <p id="route-count-help" className="field-help">Número entero entre 1 y 500.</p>
              {fieldErrors.routeCount && <p id="route-count-error" className="field-error" role="alert">{fieldErrors.routeCount}</p>}
            </div>

            <div className="waitlist-field">
              <label htmlFor="whatsapp">WhatsApp de contacto</label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                value={form.whatsapp}
                onChange={(event) => updateForm("whatsapp", sanitizeDigits(event.target.value, 10))}
                aria-invalid={Boolean(fieldErrors.whatsapp)}
                aria-describedby={fieldErrors.whatsapp ? "whatsapp-error" : "whatsapp-help"}
                required
              />
              <p id="whatsapp-help" className="field-help">10 dígitos, sin prefijo ni espacios.</p>
              {fieldErrors.whatsapp && <p id="whatsapp-error" className="field-error" role="alert">{fieldErrors.whatsapp}</p>}
            </div>

            <div className="waitlist-consent">
              <label>
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) => updateForm("consent", event.target.checked)}
                  aria-invalid={Boolean(fieldErrors.consent)}
                />
                Autorizo guardar estos datos para dar seguimiento a mi solicitud
                de acceso B2B. Entiendo que puedo cerrar sesión sin enviarlos.
              </label>
              {fieldErrors.consent && <p className="field-error" role="alert">{fieldErrors.consent}</p>}
            </div>

            {formError && <p className="error-message" role="alert">{formError}</p>}
            <button className="primary-action waitlist-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando solicitud…" : "Enviar solicitud"}
            </button>
          </form>
        )}

        <p className="waitlist-public-channel">
          {PUBLIC_SOCIAL_CHANNEL_URL ? (
            <a href={PUBLIC_SOCIAL_CHANNEL_URL} target="_blank" rel="noreferrer">
              Visita nuestro canal social público
            </a>
          ) : (
            "Canal social público: enlace pendiente de confirmar."
          )}
        </p>
        <Link className="waitlist-back-link" to="/distribution">Volver a Distribución</Link>
      </section>
    </main>
  );
}
